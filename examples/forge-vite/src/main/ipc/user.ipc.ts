import { getIpcContext, ipcClass, ipcMethod } from 'electron-ipc-handler';

interface User {
	id: number;
	name: string;
}

const users: User[] = [
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
];

@ipcClass('users')
export class UserIpcHandler {
	@ipcMethod()
	getAll() {
		return users;
	}

	@ipcMethod()
	getById(id: number) {
		return users.find((u) => u.id === id);
	}

	@ipcMethod()
	create(name: string) {
		const { sender } = getIpcContext();
		console.log(`[users:create] requested by window ${sender.id}`);
		const user = { id: users.length + 1, name };
		users.push(user);
		return user;
	}
}
