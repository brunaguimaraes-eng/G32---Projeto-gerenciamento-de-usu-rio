class UserController {

    /* captura os elementos HTML do formulário e da tabela, guarda esses elementos nas propriedades this.formEl e this.tableEl 
    para poder manipulá-los no resto do código.*/
    constructor(formId, tableId){

        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

       this.onSubmit();
        
    }

    //Ele adiciona um ouvinte de eventos no formulário. Quando o usuário clica no botão de "Salvar/Enviar", este evento é disparado.
    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            //impede o comportamento padrão do navegador de atualizar a página
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]"); //procura pelo botão de submit
            let values = this.getValues();
           
            if (!values) return false;

            btn.disabled = true;           

            this.getPhoto().then(
                (content) => {
                    values.photo = content;
                    
                    // Ele pega esse usuário extraído e manda para a função que vai desenhá-lo na tela.
                    this.addLine(values);

                    this.formEl.reset(); // reseta o formulário após o envio

                    btn.disabled = false;

                },
                (e) => {
                    console.error(e);
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
    getValues(){
        
        let user = {};
        let isValid = true; //variável para valdar se o forms está ok

        [...this.formEl.elements].forEach(function (field, index){

            //SE o campo atual estiver na minha lista de obrigatórios E ele estiver vazio, ENTÃO marque o formulário como inválido
            if(['name', 'email', 'password', 'birth', 'country'].indexOf(field.name) > -1 && !field.value){

                isValid = false;
                
                console.warn(`Campo ${field.name} deletou o required, parou no JS`); //caso o usuário delete o required no f12
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

        /*Ele injeta uma nova linha de tabela (<tr>) usando Template Literals (as crases `). Os ${dataUser.name}, ${dataUser.email}, etc., 
        são substituídos pelos valores reais do usuário, criando a interface na tela.*/              
        tr.innerHTML = `            
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${dataUser.birth}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
           
        `;
        this.tableEl.appendChild(tr);
    }

}