import { Program } from 'esast/lib/ast';
import { Module } from '../MsAst';
import VerifyResults from '../VerifyResults';
export default function transpile(moduleExpression: Module, verifyResults: VerifyResults): Program;
