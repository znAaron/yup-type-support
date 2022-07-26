import * as ts from 'typescript'
import { factory } from 'typescript';

import type YtContext from './YupType.Context';
import type { InterfaceDetail, InterfaceEntry } from './YupType.Context';
import type { NodeVisitor } from '@znaaron/simple-ts-transform'

export class DFAVisitor implements NodeVisitor<ts.Node> {
  public constructor(private readonly context: YtContext) {
  }
  
  public wants(node: ts.Node): node is ts.VariableDeclaration {
    return ts.isVariableDeclaration(node)
  }
  
  public visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)) {
      return this.visitVariableDeclaration(node)
    }

    return [node]; 
  }

  private visitVariableDeclaration(node: ts.VariableDeclaration): ts.Node[] {
    const typeNode = node.type as ts.TypeNode
    if (!typeNode) {
      return [node]
    }

    const initCallExpress = node.initializer as ts.CallExpression
    // not target
    if (!initCallExpress || initCallExpress.getText() !== "yup.object(/* guess schema */)") {
      return [node]
    }

    const typeRefNode = typeNode as ts.TypeReferenceNode
    const typeArgs = typeRefNode.typeArguments
    // no type arg
    if (!typeArgs) {
      return [node]
    }
    const typeRef = typeArgs[0] as ts.TypeReferenceNode
    const typeName = typeRef.typeName
    // type name is not identifier
    if(!ts.isIdentifier(typeName)) {
      return [node]
    }
    const typeIdent = typeName as ts.Identifier;
    const typeSymbol = this.context.checker.getSymbolAtLocation(typeIdent);
    // can not find the declaration
    if (!typeSymbol || !typeSymbol.declarations){
      return [node]
    }
    // change later to support type as well
    const typeDecl = typeSymbol.declarations[0] as ts.InterfaceDeclaration;

    const interfaceDetail = this.getInterfaceDetail(typeDecl);
    const transformedCallExpr = this.generateYupSchema(interfaceDetail)

    const newNode = ts.factory.updateVariableDeclaration(node, node.name, undefined, node.type, transformedCallExpr);
    return [newNode]
  }

  private getInterfaceDetail(node: ts.InterfaceDeclaration): InterfaceDetail {
    const detail: InterfaceDetail = {
      name: node.name.getText(),
      entries: node.members.map(entry => this.propertySignatureToEntry(entry))
    };
    return detail;
  }

  private propertySignatureToEntry(node: ts.TypeElement): InterfaceEntry {
    // add more support for other type than property signature
    const propSigNode = node as ts.PropertySignature;
    return {
      name: propSigNode.name.getText(),
      type: this.nodeTypeToYupType(propSigNode.type),
      optional: propSigNode.questionToken ? true : false
    }
  }

  private nodeTypeToYupType(type: ts.TypeNode | undefined): "number" | "string" | "unkown" {
    if (!type) {
      return "unkown"
    }

    switch (type.kind) {
      case ts.SyntaxKind.StringKeyword:
        return "string";
      case ts.SyntaxKind.NumberKeyword:
        return "number";
      default:
        return "unkown"
    }
  }

  private generateYupSchema(detail: InterfaceDetail): ts.CallExpression {
    
    const schemaEntries = detail.entries.map((entry) => this.generateYupSchema_entry(entry));
  
    const schemaObj = factory.createCallExpression (
      factory.createPropertyAccessExpression(
        factory.createIdentifier("yup"),
        factory.createIdentifier("object")
      ),
      undefined,
      [factory.createObjectLiteralExpression(
        schemaEntries,true
      )]
    );
    
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