import * as ts from 'typescript'
import { factory } from 'typescript';

import YtContext, { InterfaceDetail, InterfaceEntry } from './YupType.Context'
import type { NodeVisitor } from '@znaaron/simple-ts-transform'

const enum DFANodeGroup {
  InterfaceDeclaration = "InterfaceDeclaration",
  ExportKeyword = "ExportKeyword",
  Identifier = "Identifier",
  PropertySignature = "PropertySignature",
  QuestionToken = "QuestionToken",
  TypeKeyword = "TypeKeyword",
  Others = "Others"
}

function determineNodeGroup(node : ts.Node): string {
  if (ts.isInterfaceDeclaration(node)){
    return DFANodeGroup.InterfaceDeclaration;
  } else if (ts.isToken(node) && node.kind === ts.SyntaxKind.ExportKeyword) {
    return DFANodeGroup.ExportKeyword;
  } else if (ts.isIdentifier(node)) {
    return DFANodeGroup.Identifier;
  } else if (ts.isPropertySignature(node)) {
    return DFANodeGroup.PropertySignature;
  } else if (ts.isToken(node) && node.kind === ts.SyntaxKind.QuestionToken) {
    return DFANodeGroup.QuestionToken;
  } else if (ts.isToken(node) && 
    (node.kind === ts.SyntaxKind.StringKeyword
    || node.kind === ts.SyntaxKind.NumberKeyword)) {
    return DFANodeGroup.TypeKeyword;
  } else {
    return DFANodeGroup.Others;
  }
}

const DFAMap = {
  0: {"InterfaceDeclaration": 1},
  1: {"ExportKeyword" : 2, "Identifier": 3},
  2: {"Identifier": 3},
  3: {"PropertySignature": 4, "InterfaceDeclaration": 8, "ExportKeyword": 8, 
      "Identifier": 8, "QuestionToken": 8, "TypeKeyword": 8, "Others": 8},
  4: {"Identifier": 5},
  5: {"QuestionToken": 6, "TypeKeyword": 7},
  6: {"TypeKeyword": 7},
  7: {"PropertySignature": 4, "InterfaceDeclaration": 8, "ExportKeyword": 8, 
      "Identifier": 8, "QuestionToken": 8, "TypeKeyword": 8, "Others": 8},
  8: {}
}

export class DFAVisitor implements NodeVisitor<ts.Node> {
  public constructor(private readonly context: YtContext) {
  }
  
  public wants(node: ts.Node): node is ts.Node {
    return determineNodeGroup(node) in DFAMap[this.context.DFAState]
  }
  
  public visit(node: ts.Node) {
    console.log("%i --- %s ---> %i",this.context.DFAState, determineNodeGroup(node).padEnd(20,' '), DFAMap[this.context.DFAState][determineNodeGroup(node)])

    switch (this.context.DFAState) {
      case (1):
        if (determineNodeGroup(node) === DFANodeGroup.Identifier) {
          this.context.currInterface.name = node.getText();
        }
        break;
      case (2):
        if (determineNodeGroup(node) === DFANodeGroup.Identifier) {
          this.context.currInterface.name = node.getText();
        }
        break;
      case (3):
        break;
      case (4):
        if (determineNodeGroup(node) === DFANodeGroup.Identifier) {
          this.context.currInterface.tmp.name = node.getText();
        }
        break;
      case (5):
        if (determineNodeGroup(node) === DFANodeGroup.TypeKeyword) {
          if (node.kind === ts.SyntaxKind.StringKeyword) {
            this.context.currInterface.tmp.type = "string";
          } else if (node.kind === ts.SyntaxKind.NumberKeyword) {
            this.context.currInterface.tmp.type = "number";
          }
        } else if (determineNodeGroup(node) === DFANodeGroup.QuestionToken) {
          this.context.currInterface.tmp.optional = true;
        }
        break;
      case (6):
        if (determineNodeGroup(node) === DFANodeGroup.TypeKeyword) {
          if (node.kind === ts.SyntaxKind.StringKeyword) {
            this.context.currInterface.tmp.type = "string";
          } else if (node.kind === ts.SyntaxKind.NumberKeyword) {
            this.context.currInterface.tmp.type = "number";
          }
        }
        break;
      case (7):
        this.context.currInterface.entries.push({
          name: this.context.currInterface.tmp.name,
          type: this.context.currInterface.tmp.type,
          optional: this.context.currInterface.tmp.optional
        })
        this.context.currInterface.tmp = {
          name: "",
          type: "string",
          optional: false
        }

        if (DFAMap[this.context.DFAState][determineNodeGroup(node)] === 8) {
          console.log(this.context.currInterface);
        }
        break;
      case (8):
        break;
      default:
        break;
    }

    this.context.DFAState = DFAMap[this.context.DFAState][determineNodeGroup(node)];

    if (this.context.DFAState == 8) {
      const yupSchema = this.generateYupSchema(this.context.currInterface);
      return [yupSchema, node];
    }
    return [node]; 
  }

  private generateYupSchema(detail: InterfaceDetail): ts.Node {
    const schemaName = detail.name + "Schema";
    const schemaEntries = detail.entries.map(this.generateYupSchema_entry);
  
    const schemaObj = factory.createVariableStatement(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(
          factory.createIdentifier(schemaName),
          undefined,
          factory.createTypeReferenceNode(
            factory.createQualifiedName(
              factory.createIdentifier("yup"),
              factory.createIdentifier("SchemaOf")
            ),
            [factory.createTypeReferenceNode(
              factory.createIdentifier(detail.name),
              undefined
            )]
          ),
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("yup"),
              factory.createIdentifier("object")
            ),
            undefined,
            [factory.createObjectLiteralExpression(
              schemaEntries,true
            )]
          )
        )],
        ts.NodeFlags.Const
      )
    )
    
    return schemaObj;
  }
  
  private generateYupSchema_entry(entry: InterfaceEntry) : ts.PropertyAssignment {
    return factory.createPropertyAssignment(
      factory.createIdentifier(entry.name),
      factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier("yup"),
              factory.createIdentifier(entry.type)
            ),
            undefined,
            []
          ),
          factory.createIdentifier(entry.optional ? "optional" : "required")
        ),
        undefined,
        []
      )
    )
  }
}