class User {

    constructor(name, gender, birth, country, email, password, photo, admin){

        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get register(){
        return this._register.toLocaleDateString('pt-br') + ' ' +
            this._register.toLocaleTimeString('pt-br', {
                hour: '2-digit',
                minute: '2-digit'
            })
    }

    get name(){
        return this._name;        
    }

    get gender(){
        return this._gender;        
    }

    get birth(){
        return this._birth;        
    }

    get country(){
        return this._country;        
    }

    get email(){
        return this._email;        
    }

    get password(){
        return this._password;        
    }

    get photo(){
        return this._photo;        
    }

    get admin(){
        return this._admin;        
    }

    set photo(value){
        this._photo = value;
    }

}

/*Esse código é um molde para criação de usuários, sempre que precisar registrar um usuário novo, esse construtor que vai criar um 
objeto para guardar as informações. Apenas guarda os dados.*/