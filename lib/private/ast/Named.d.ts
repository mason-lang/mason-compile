import { Val } from './LineContent';
interface Named extends Val {
    isNamed(): void;
}
export default Named;
export declare function isNamed(_: Val): _ is Named;
