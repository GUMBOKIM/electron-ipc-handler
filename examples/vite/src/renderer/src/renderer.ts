import { ipc } from './ipc/ipc.client';

async function init() {
	const pong = await ipc.system.ping('hello');
	const pingEl = document.getElementById('ping-result');
	if (pingEl) pingEl.textContent = pong;

	const version = await ipc.system.getVersion();
	const versionEl = document.getElementById('version-result');
	if (versionEl) versionEl.textContent = version;

	const users = await ipc.users.getAll();
	const list = document.getElementById('user-list');
	if (list) {
		for (const user of users) {
			const li = document.createElement('li');
			li.textContent = `#${user.id} ${user.name}`;
			list.appendChild(li);
		}
	}
}

init();
