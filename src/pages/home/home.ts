import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Md5 } from 'ts-md5/dist/md5';
import { SQLite } from 'ionic-native';
import {Platform} from 'ionic-angular';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {

	username: string;
	password: string;
  	db: SQLite;

	constructor(public navCtrl: NavController, public alertCtrl: AlertController, public platform:Platform) {
		platform.ready().then(() => {
			this.db = new SQLite();
			this.criarBanco();
		});
	}

	criarBanco(){
		this.db.openDatabase({
			name: 'data.db',
			location: 'default'
		}).then(() => {
			this.criarTabela();			
		}, (err) => {
			this.exibirAlerta('Unable to open database: ',err);
		});
	}

	criarTabela(){
		this.db.executeSql('CREATE TABLE IF NOT EXISTS usuario(id INTEGER PRIMARY KEY AUTOINCREMENT,username VARCHAR(255), password VARCHAR(255))', {}).then(() => {
		}, (err) => {
			this.exibirAlerta('Unable to execute sql: ',err);
		});
	}
	
	login(){			
		if(this.username && this.password){
			this.db.executeSql('SELECT password FROM usuario WHERE username = ? ',[this.username]).then((data) => {
				if(data.rows.length > 0){
					this.validaUsuario(data);
				}else{
					this.gravaUsuario();
				}
			}, (err) => {
				this.exibirAlerta('Erro ao obter usuário: ',err);
			});
		}else{
			this.exibirAlerta("Alerta","Preencha todos os campos" );
		}	
	}

 	validaUsuario(data){
		let senhaUsuario = data.rows.item(0).password;
	   if(senhaUsuario == Md5.hashStr(this.password)){
			this.exibirAlerta("Caro Usuário","Seja bem vindo!");
		}else{
			this.exibirAlerta("Alerta","Credenciais inválidas!");
		}
   }

	exibirAlerta(titulo: string, msg: string){
		let alert = this.alertCtrl.create({
		title: titulo,
		subTitle: msg,
		buttons: ['OK']
		});
		alert.present();
  }

  gravaUsuario(){
	  this.db.executeSql('INSERT INTO usuario(username,password) VALUES(?,?)',[this.username, Md5.hashStr(this.password).toString()]).then(() => {
			this.exibirAlerta("Sucesso","cadastro realizado");
		}, (err) => {
			this.exibirAlerta('Erro ao gravar usuário: ',err);
		});
  }
}
