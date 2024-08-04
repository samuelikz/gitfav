import { GithubUser } from "./GithubUsers.js";

export class Favoritos {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.users = JSON.parse(localStorage.getItem('@github-favoritos')) || [];
        this.updateDisplay();
    }

    save() {
        localStorage.setItem('@github-favoritos', JSON.stringify(this.users));
    }

    async add(username) {
        try {
            const userExists = this.users.find(user => user.login === username);

            if (userExists) {
                throw new Error("Usuário já cadastrado!");
            }

            const user = await GithubUser.search(username);

            if (user.login === undefined) {
                throw new Error("Usuário não encontrado!");
            }

            this.users = [user, ...this.users];
            this.update();
            this.save();
            this.updateDisplay();

        } catch (error) {
            alert(error.message);
        }
    }

    delete(userToDelete) {
        this.users = this.users.filter(user => user.login !== userToDelete.login);
        this.update();
        this.save();
        this.updateDisplay();
    }

    updateDisplay() {
        const displayOn = this.root.querySelector('.display-on');
        const tabela = this.root.querySelector('.tabela');

        if (this.users.length === 0) {
            displayOn.classList.remove('display-off');
            tabela.classList.add('display-off');
        } else {
            displayOn.classList.add('display-off');
            tabela.classList.remove('display-off');
        }
    }
}

export class FavoritosView extends Favoritos {
    constructor(root) {
        super(root);
        this.tbody = this.root.querySelector("table tbody");

        this.update();
        this.onadd();
    }

    onadd() {
        const addButton = this.root.querySelector('.search button');
        addButton.addEventListener('click', () => {
            const { value } = this.root.querySelector('.search input');
            this.add(value);
        });
    }

    update() {
        this.removeAllTr();

        this.users.forEach(user => {
            const row = this.createRow();

            row.querySelector('.user img').src = user.avatar_url;
            row.querySelector('.user img').alt = `Imagem de ${user.name}`;
            row.querySelector('.user p').textContent = user.name;
            row.querySelector('.user span').textContent = "/" + user.login;
            row.querySelector('.user a').href = `https://github.com/${user.login}`;
            row.querySelector('.repositories').textContent = user.public_repos;
            row.querySelector('.followers').textContent = user.followers;

            row.querySelector('.remove').addEventListener('click', () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?');
                if (isOk) {
                    this.delete(user);
                }
            });

            this.tbody.appendChild(row);
        });
    }

    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
                <a href="https://github.com/maykbrito" target="_blank">
                    <p>Mayk Brito</p>
                    <span>maykbrito</span>
                </a>
            </td>
            <td class="repositories">
                76
            </td>
            <td class="followers">
                9589
            </td>
            <td>
                <button class="remove">Remover</button>
            </td>
        `;

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove();
        });
    }
}
