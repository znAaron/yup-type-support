"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountValidSchema = exports.accountSchema = void 0;
const index_1 = __importDefault(require("../../index"));
exports.accountSchema = yup.object({
    id: yup.number().required(),
    name: yup.string().required(),
    password: yup.string().required(),
    note: yup.string().optional()
});
exports.accountValidSchema = (0, index_1.default)();
