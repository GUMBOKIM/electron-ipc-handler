import { beforeEach, describe, expect, it } from 'vitest';
import { ipcClass, ipcMethod } from './decorators';
import { classRegistry } from './registry';

describe('decorators', () => {
	beforeEach(() => {
		classRegistry.length = 0;
	});

	it('ipcClass + ipcMethod registers class with methods', () => {
		@ipcClass('users')
		class UserController {
			@ipcMethod()
			getAll() {
				return [];
			}

			@ipcMethod()
			getById(id: number) {
				return { id };
			}
		}

		// Suppress unused variable warning
		void UserController;

		expect(classRegistry).toHaveLength(1);
		expect(classRegistry[0].namespace).toBe('users');
		expect(classRegistry[0].methods).toHaveLength(2);
		expect(classRegistry[0].methods).toEqual(
			expect.arrayContaining([
				{ channel: 'getAll', propertyKey: 'getAll' },
				{ channel: 'getById', propertyKey: 'getById' },
			])
		);
	});

	it('ipcMethod accepts custom channel name', () => {
		@ipcClass('items')
		class ItemController {
			@ipcMethod('list')
			getItems() {
				return [];
			}
		}

		void ItemController;

		expect(classRegistry[0].methods).toEqual([{ channel: 'list', propertyKey: 'getItems' }]);
	});

	it('ipcClass preserves the original class', () => {
		@ipcClass('test')
		class TestController {
			@ipcMethod()
			hello() {
				return 'world';
			}
		}

		const instance = new TestController();
		expect(instance.hello()).toBe('world');
	});

	it('registers multiple classes independently', () => {
		@ipcClass('alpha')
		class AlphaController {
			@ipcMethod()
			run() {}
		}

		@ipcClass('beta')
		class BetaController {
			@ipcMethod()
			exec() {}
		}

		void AlphaController;
		void BetaController;

		expect(classRegistry).toHaveLength(2);
		expect(classRegistry[0].namespace).toBe('alpha');
		expect(classRegistry[1].namespace).toBe('beta');
	});

	it('class without ipcMethod registers with empty methods', () => {
		@ipcClass('empty')
		class EmptyController {}

		void EmptyController;

		expect(classRegistry).toHaveLength(1);
		expect(classRegistry[0].methods).toHaveLength(0);
	});
});
