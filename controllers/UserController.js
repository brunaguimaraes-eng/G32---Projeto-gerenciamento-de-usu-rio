class UserController {

    /* captura os elementos HTML do formulário e da tabela, guarda esses elementos nas propriedades this.formEl e this.tableEl 
    para poder manipulá-los no resto do código.*/
    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

       this.onSubmit();
       this.onEdit();
        
    }

    //quando o usuário clicar em editar, exibe o forms de edição.
    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {

            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto().then(
                (content => {

                    if (!values._photo){
                        result._photo = userOld._photo;
                    } else {
                        result.photo = content
                    }
                })
            )
            
            tr.dataset.user = JSON.stringify(result);

            tr.innerHTML = `            
            <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${result._name}</td>
            <td>${result._email}</td>
            <td>${(result._admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(result._register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>           
        `;

        this.addEventsTr(tr);

        this.updateCount();

        btn.disabled = false;
        this.showPanelCreate();

        });

    }

    //Ele adiciona um ouvinte de eventos no formulário. Quando o usuário clica no botão de "Salvar/Enviar", este evento é disparado.
    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            //impede o comportamento padrão do navegador de atualizar a página
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]"); //procura pelo botão de submit

            let values = this.getValues(this.formEl); //chama o método getValues que percorre os campos           
            if (!values) return false; //se algum campo estiver vazio o código para aqui

            btn.disabled = true; //assim que o código passa pela validação, desabilita o botão de enviar.          

            this.getPhoto().then(
                (content) => {
                    values.photo = content;
                    
                    //pela o objeto values que agora está com nome, email e senha e insere uma nova linha na tabela.Usuário vê o que digitou
                    this.addLine(values);

                    //pop-up de sucesso
                    Swal.fire({
                        title: "Sucesso",
                        text: "Usuário cadastrado com sucesso!",
                        icon:"success",
                        confirmButtonText:"Ok",
                        timer: 5000 //fecha sozinha depois de 5 segundos
                    })

                    this.formEl.reset(); // reseta o formulário após o envio

                    btn.disabled = false;

                },
                (e) => {
                    Swal.fire({
                        title: "Erro!",
                        text: e,
                        icon: "error",
                        confirmButtonText: "Ok!"
                    });

                    btn.disabled = false; //reativa o botão para o usuário tentar novamente.
                }
            );         
            
        
        });        

    }

    getPhoto(){

        //Assíncrono, a promessa garante que o programa espere a leitura terminar antes de tentar usar o resultado
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            //essa linha diz: filtre os itens onde o nome do item é igual a photo.  
            let elements = [...this.formEl.elements].filter(item => item.name === 'photo');       

            let file = elements[0].files[0]; //pega o primeiro arquivo nesse input

            //validação se a foto enviada é realmente um arquivo de imagem.
            if (file) {

                if (file.type.split('/')[0] !== 'image'){
                    reject("Formato de imagem incompatível. Por favor, envie um arquivo de imagem.");
                    return; 

                }

            }


            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = (e) => {
                reject(e);
            }

            /*Se existir um arquivo selecionado a leitura do arquivo é iniciada e converte o binário a uma string Base64, quando finaliza
            o onload é disparado*/
            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg'); //se não ele entrega uma imagem previamente selecionada.
            }
        })

    }

    //Aqui ele varre (faz um loop com forEach) todos os campos do seu formulário.
    getValues(formEl){
        
        let user = {};
        let isValid = true;
        
        [...formEl.elements].forEach(function (field, index){

            //SE o campo atual estiver na minha lista de obrigatórios E ele estiver vazio, ENTÃO marque o formulário como inválido
            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;                
            }
           
            //checa qual opção do gender está marcada e só guarda a info que está marcada
            if(field.name == "gender"){

                if (field.checked) {
                    user[field.name] = field.value;
                }

            
            } else if(field.name == "admin"){

                user[field.name] = field.checked;

            }
            //Para todos os outros campos digitados, ele guarda no objeto user e usa o nome do campo como uma etiqueta
            else{

                user[field.name] = field.value;
            }      

        });

            if (!isValid){
                return false;
            }


        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );
    }

    //Ele recebe o objeto User que acabou de ser criado e altera o HTML da sua tabela
    addLine(dataUser){

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        /*Ele injeta uma nova linha de tabela (<tr>) usando Template Literals (as crases `). Os ${dataUser.name}, ${dataUser.email}, etc., 
        são substituídos pelos valores reais do usuário, criando a interface na tela.*/              
        tr.innerHTML = `            
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>           
        `;

        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    addEventsTr(tr){

        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user); //transforma o texto em um objeto, ex:{"nome":"João"}" vira o objeto json.nome
            
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            
            //percorre as propriedades do json, se tiver nome, email e gender, ele roda 3x.
            for (let name in json){

                //procura no form onde o atributo name seja igual o json ex: _name remove o _ e procura por name.
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]")            

                if (field){

                    switch(field.type){
                        case 'file': 
                        continue;
                        break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]")
                            field.checked = true;
                        break;

                        case 'checkbox':
                            field.checked = json[name];
                        break;

                        default:
                            field.value = json[name];

                    }
                    
                    
                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();         

        });
    }

    showPanelCreate(){

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";


    }

    showPanelUpdate(){

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            let user = JSON.parse(tr.dataset.user);

            numberUsers++;

            if(user._admin)numberAdmin++;           
        })

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;


    }

}