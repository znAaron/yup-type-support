import * as ts from 'typescript';
import {factory} from 'typescript';

import type YtContext from './YupType.Context';
import {InterfaceDetail, InterfaceEntry, TypescriptType} from './YupType.Context';
import type {NodeVisitor} from '@znaaron/simple-ts-transform';

export class DFAVisitor implements NodeVisitor<ts.Node> {
  public constructor(private readonly context: YtContext) {
  }

  /**
   * NodeVisitor Interface Method
   * @param node the node to check
   * @return if we want to visit the node
   */
  public wants(node: ts.Node): node is ts.VariableDeclaration {
    return ts.isVariableDeclaration(node);
  }

  /**
   * NodeVisitor Interface Method
   * @param node the node to visit
   * @return the tranformed nodes or the original nodes
   */
  public visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)) {
      return this.visitVariableDeclaration(node);
    }

    return [node];
  }

  /**
   * Visit the decleration to see if it is the target
   * @param node the variable declaration node
   * @return A converted schema if it is the target
   */
  private visitVariableDeclaration(node: ts.VariableDeclaration): ts.Node[] {
    const typeNode = node.type as ts.TypeNode;
    // node type found for the declaration
    if (!typeNode) {
      return [node];
    }

    const initCallExpress = node.initializer as ts.CallExpression;
    // not target
    if (!initCallExpress || initCallExpress.getText() !== 'yup.object(/* guess schema */)') {
      return [node];
    }

    const typeRefNode = typeNode as ts.TypeReferenceNode;
    const typeArgs = typeRefNode.typeArguments;
    // no type arg
    if (!typeArgs) {
      return [node];
    }
    const typeRef = typeArgs[0] as ts.TypeReferenceNode;
    const typeName = typeRef.typeName;
    // type name is not identifier
    if (!ts.isIdentifier(typeName)) {
      return [node];
    }
    const typeIdent = typeName as ts.Identifier;
    const typeSymbol = this.context.checker.getSymbolAtLocation(typeIdent);
    // can not find the declaration
    if (!typeSymbol || !typeSymbol.declarations) {
      return [node];
    }
    // change later to support type as well
    const typeDecl = typeSymbol.declarations[0] as ts.InterfaceDeclaration;

    const interfaceDetail = this.getInterfaceDetail(typeDecl);
    const transformedCallExpr = this.generateYupSchema(interfaceDetail);

    const newNode = ts.factory.updateVariableDeclaration(node, node.name, undefined, node.type, transformedCallExpr);
    return [newNode];
  }

  /**
   * Get the interface detail from the interface declaration node
   * @param node the interface declaration node to get the details from
   * @return the interface detail
   */
  private getInterfaceDetail(node: ts.InterfaceDeclaration): InterfaceDetail {
    const detail: InterfaceDetail = {
      name: node.name.getText(),
      entries: node.members.map((entry) => this.propertySignatureToEntry(entry)),
    };
    return detail;
  }

  // convert one property signature to one interface entry
  private propertySignatureToEntry(node: ts.TypeElement): InterfaceEntry {
    const propSigNode = node as ts.PropertySignature;
    return {
      name: propSigNode.name.getText(),
      type: this.getNodeType(propSigNode.type),
      optional: propSigNode.questionToken ? true : false,
    };
  }

  private getNodeType(type: ts.TypeNode | undefined): TypescriptType {
    if (!type) {
      return TypescriptType.TsOther;
    }

    switch (type.kind) {
      case ts.SyntaxKind.StringKeyword:
        return TypescriptType.TsString;
      case ts.SyntaxKind.NumberKeyword:
        return TypescriptType.TsNumber;
      case ts.SyntaxKind.BooleanKeyword:
        return TypescriptType.TsBoolean;
      default:
        return TypescriptType.TsOther;
    }
  }

  /**
   * Generate the yup schema based on the interface detail
   * @param detail the interface details to convert to yup schema
   * @return a call expression node to create yup object
   */
  private generateYupSchema(detail: InterfaceDetail): ts.CallExpression {
    const schemaEntries = detail.entries.map((entry) => this.generateYupSchema_entry(entry));

    const schemaObj = factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createIdentifier('yup'),
            factory.createIdentifier('object'),
        ),
        undefined,
        [factory.createObjectLiteralExpression(
            schemaEntries, true,
        )],
    );

    return schemaObj;
  }

  // generate schema for one entry
  private generateYupSchema_entry(entry: InterfaceEntry): ts.PropertyAssignment {
    return factory.createPropertyAssignment(
        factory.createIdentifier(entry.name),
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createCallExpression(
                    factory.createPropertyAccessExpression(
                        factory.createIdentifier('yup'),
                        factory.createIdentifier(entry.type),
                    ),
                    undefined,
                    [],
                ),
                factory.createIdentifier(entry.optional ? 'optional' : 'required'),
            ),
            undefined,
            [],
        ),
    );
  }
}
