import { Module as EsModule } from 'esast/lib/Program';
import Module from '../ast/Module';
import VerifyResults from '../VerifyResults';
export default function transpile(moduleExpression: Module, verifyResults: VerifyResults): EsModule;
