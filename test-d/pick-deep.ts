import {expectType} from 'tsd';
import type {PickDeep} from '../source/pick-deep.d';

declare class ClassA {
	a: string;
}

type BaseType = {
	string: string;
	number: number;
	boolean: boolean;
	date: Date;
	Class: typeof ClassA;
	instance: ClassA;
};

type Testing = BaseType & {
	object: BaseType;
	optionalObject?: Partial<BaseType>;
};

declare const normal: PickDeep<Testing, 'string'>;
expectType<{string: string}>(normal);

declare const deep: PickDeep<Testing, 'object.number'>;
expectType<{object: {number: number}}>(deep);

declare const union: PickDeep<Testing, 'object.number' | 'object.string'>;
expectType<{object: {number: number} & {string: string}}>(union);

declare const optional: PickDeep<Testing, 'optionalObject.string'>;
expectType<{optionalObject?: {string?: string}}>(optional);

declare const optionalUnion: PickDeep<Testing, 'optionalObject.string' | 'object.number'>;
expectType<{optionalObject?: {string?: string}; object: {number: number}}>(optionalUnion);

declare const date: PickDeep<Testing, 'object.date'>;
expectType<{object: {date: Date}}>(date);

declare const instance: PickDeep<Testing, 'object.instance'>;
expectType<{object: {instance: ClassA}}>(instance);

declare const classTest: PickDeep<Testing, 'object.Class'>;
expectType<{object: {Class: typeof ClassA}}>(classTest);
