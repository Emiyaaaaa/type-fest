import type {ArrayLength} from './internal';
import type {Subtract} from './subtract';
import type {UnknownArray} from './unknown-array';

/**
 * Builds an array by repeating the given array items the specified number of times.
 *
 * @example
 * ```
 * type FlatArr0 = BuildRepeatedArray<[number, string], 3>;
 * //=> type FlatArr0 = [number, string, number, string, number, string];
 * ```
 */
type BuildRepeatedArray<T extends UnknownArray, N extends number, R extends unknown[] = [], CopyT extends UnknownArray = T> =
	N extends 0
		? R
		: BuildRepeatedArray<T, Subtract<N, 1>, [...R, ...CopyT]>;

type ArrayFlatOptions = {
	/**
	 * The number of times to repeat the array items when flattening an non-fixed length array.
	 *
	 * @example
	 * ```
	 * type FlatArr0 = ArrayFlat<Array<number, string>, 1, { repeat: 3 }>;
	 * //=> type FlatArr0 = [number?, string?, number?, string?, number?, string?];
	 * ```
	 *
	 * @default 10
	 */
	repeat: number;
};

type ArrayFlatDefaultOptions = {
	repeat: 10;
};

/**
Creates a new array type by flattening an array to a specified depth.

Use-case: Flatten an array type to a specified depth.

Like [`Array#flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) but for types.

@example
```
import type {ArrayFlat, PositiveInfinity} from 'type-fest';

type FlatArr0 = ArrayFlat<[[0, 1], [2, 3], [4, 5]]>;
//=> type FlatArr0 = [0, 1, 2, 3, 4, 5];

// Flatten to depth
type Arr1 = [[0, [1, [2, [3, [4, [5]]]]]]];
type FlatArr1 = ArrayFlat<Arr1, 1>;
//=> type FlatArr1 = [0, [1, [2, [3, [4, [5]]]]]];

type FlatArr2 = ArrayFlat<Arr1, 3>;
//=> type FlatArr2 = [0, 1, 2, [3, [4, [5]]]];

// Flatten to depth Infinity
type FlatArr3 = ArrayFlat<Arr1, PositiveInfinity>;
//=> type FlatArr3 = [0, 1, 2, 3, 4, 5];
```

@category Array
*/
export type ArrayFlat<T, Depth extends number = 1, Options extends ArrayFlatOptions = ArrayFlatDefaultOptions> =
InternalArrayFlat<T, Depth, Options>;

// Internal implementation
type InternalArrayFlat<T, Depth extends number = 1, Options extends ArrayFlatOptions = ArrayFlatDefaultOptions, Result extends UnknownArray = []> =
T extends UnknownArray
	? T['length'] extends 0
		? [...Result, ...T]
		: Depth extends 0
			? [...Result, ...T]
			: number extends T['length']
				// Handle non-fixed length arrays
				? [
					...Result,
					...(
						T[number] extends UnknownArray
							? InternalArrayFlat<
							number extends ArrayLength<T[number]> ? T[number] : Partial<T[number]>,
							Subtract<Depth, 1>,
							Options
							> extends infer Item
								? Item extends UnknownArray
									? BuildRepeatedArray<Item, Options['repeat']>
									: never // Never happens, just for fixed ts error TS2589: Type instantiation is excessively deep and possibly infinite.
								: never // Never happens, just for fixed ts error TS2589: Type instantiation is excessively deep and possibly infinite.
							: T
					),
				]
				// Handle fixed length arrays
				: T extends readonly [infer ArrayItem, ...infer Last]
					?	[ArrayItem] extends [UnknownArray]
						? InternalArrayFlat<Last, Depth, Options, [...Result, ...InternalArrayFlat<ArrayItem, Subtract<Depth, 1>, Options>]>
						: InternalArrayFlat<Last, Depth, Options, [...Result, ArrayItem]>
					: [...Result, ...T]
	: [];

type A = ArrayFlat<[boolean, [string, number?], boolean]>;
type B = ArrayFlat<[boolean, Array<[string, number?]>, boolean]>;
type C = ArrayFlat<[boolean, Array<[string, number?]>, boolean], 2>;
