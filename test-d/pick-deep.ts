import {expectType} from 'tsd';
import type {Paths, PickDeep} from '../index';

declare class ClassA {
	a: string;
}

type BaseType = {
	string: string;
	optionalString?: string;
	array: number[];
	readonlyArray: readonly number[];
	tuples: ['foo', 'bar'];
	objectArray: Array<{a: 1}>;
	leadingSpreadArray: [...Array<{a: 1}>, {b: 2}];
	tailSpreadArray: [{a: 1}, {b: {c: 2; other: 2}}, ...Array<{d: 3}>];
	objectTuple: [{a: 1}];
	number: number;
	boolean: boolean;
	date: Date;
	Class: typeof ClassA;
	instance: ClassA;
	0: number;
};

type Testing = BaseType & {
	object: BaseType;
	optionalObject?: Partial<BaseType>;
	optionalString?: string;
	readonly readonlyObject: {a: 1};
	1: BaseType;
	2?: BaseType;
};

declare const normal: PickDeep<Testing, 'string'>;
expectType<{string: string}>(normal);

type DeepType = {
	nested: {
		deep: {
			deeper: {
				value: string;
			};
		};
	};
	foo: string;
};
declare const deep: PickDeep<DeepType, 'nested.deep.deeper.value'>;
expectType<{nested: {deep: {deeper: {value: string}}}}>(deep);

type GenericType<T> = {
	genericKey: T;
};
declare const genericTest: PickDeep<GenericType<number>, 'genericKey'>;
expectType<{genericKey: number}>(genericTest);

declare const union: PickDeep<Testing, 'object.number' | 'object.string'>;
expectType<{object: {number: number} & {string: string}}>(union);

declare const optional: PickDeep<Testing, 'optionalObject.optionalString'>;
expectType<{optionalObject?: {optionalString?: string}}>(optional);

declare const optionalUnion: PickDeep<Testing, 'optionalObject.string' | 'object.number'>;
expectType<{optionalObject?: {string?: string}; object: {number: number}}>(optionalUnion);

declare const readonlyTest: PickDeep<Testing, 'readonlyObject.a'>;
expectType<{readonly readonlyObject: {a: 1}}>(readonlyTest);

declare const array: PickDeep<Testing, 'object.array'>;
expectType<{object: {array: number[]}}>(array);

declare const readonlyArray: PickDeep<Testing, 'object.readonlyArray'>;
expectType<{object: {readonlyArray: readonly number[]}}>(readonlyArray);

declare const tuple: PickDeep<Testing, 'object.tuples'>;
expectType<{object: {tuples: ['foo', 'bar']}}>(tuple);

declare const objectArray: PickDeep<Testing, `object.objectArray.${number}`>;
expectType<{object: {objectArray: Array<{a: 1}>}}>(objectArray);

declare const date: PickDeep<Testing, 'object.date'>;
expectType<{object: {date: Date}}>(date);

declare const instance: PickDeep<Testing, 'object.instance'>;
expectType<{object: {instance: ClassA}}>(instance);

declare const classTest: PickDeep<Testing, 'object.Class'>;
expectType<{object: {Class: typeof ClassA}}>(classTest);

declare const numberTest: PickDeep<Testing, '1'>;
expectType<{1: BaseType}>(numberTest);

declare const numberTest2: PickDeep<Testing, '1.0'>;
expectType<{1: {0: number}}>(numberTest2);

declare const numberTest3: PickDeep<Testing, '2.0'>;
expectType<{2?: {0: number}}>(numberTest3);
