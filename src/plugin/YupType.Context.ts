import type { NodeVisitorContext } from '@znaaron/simple-ts-transform'
import type { NodeFactory, Program, SourceFile, TransformationContext, TypeChecker } from 'typescript'
import ts from 'typescript';

export type InterfaceEntry = {
  name: string;
  //todo: change this to enum
  type: "number" | "string" | "unkown";
  optional: boolean;
}

export type InterfaceDetail = {
  name: string;
  entries: InterfaceEntry[];
}

export default class YtContext implements NodeVisitorContext {
  public readonly basePath: string
  public checker: TypeChecker
  public factory!: NodeFactory
  public fileName!: string
  public sourceFile!: SourceFile

  public originContext!: TransformationContext
  public yupSymbol!: ts.Symbol

  public constructor(program: Program, public readonly _configuration: unknown) {
    this.basePath = program.getCompilerOptions().rootDir || program.getCurrentDirectory()
    this.checker = program.getTypeChecker()
  }

  public initNewFile(context: TransformationContext, sourceFile: SourceFile): void {
    this.factory = context.factory
    this.fileName = sourceFile.fileName
    this.sourceFile = sourceFile
    this.originContext = context
  }
} 