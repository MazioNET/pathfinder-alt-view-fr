import { NgForOf, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JsonService } from '../dataView/json.service';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.less'
})
export class BuilderComponent {
  public chara : any = {};
  public ATTRIBUTS = {'str':'Force','dex':'Dextérité','con':'Constitution','int':'Intelligence','wis':'Sagesse','cha':'Charisme'};


  public EDIT_RETURN = new URL(window.location.href).searchParams.get('return');
  public EDIT_ID = new URL(window.location.href).searchParams.get('id');

  constructor(private _js: JsonService, public router: Router){
    this.loadLocal();

    if(this.EDIT_RETURN){
      if(this.EDIT_ID == 'ascendance'){
        this.loadJsonIntoCharacter('ancestries', 'ascendance' ,'_id' , false);
      }

      if(this.EDIT_ID == 'historique'){
        this.loadJsonIntoCharacter('backgrounds', 'historique' ,'_id' , false);
      }
      
    }
  }

  goToLink(url: string){
    window.open(url, "_blank");
  }

  //======================================================

  editAscendance(){
    this.router.navigate(['/ancestries'],{queryParams: {'edit': true, 'id':'ascendance'}});
  }

  editHistorique(){
    this.router.navigate(['/backgrounds'],{queryParams: {'edit': true, 'id':'historique'}});
  }

  //======================================================

  loadJsonIntoCharacter(item, ret, idType, isArray){

    const url = './assets/'+item+'.json';
    this._js.downloadFile(url).subscribe((data:any) => {
      data.forEach( element =>{
        if(this.EDIT_RETURN?.includes(element[idType])){
          //On teste si l'objet est le même qu'actuel
          if(!this.chara[ret] || this.chara[ret][idType] != element[idType]){
            //On wipe les sous-données
            this.charaLocalReset(ret);
            //Si est un array
            if(isArray){ 
              this.chara[ret].push(element);
            }
            //Si est simple
            else this.chara[ret] = (element);

            //On fait du post reset
            this.charaPostReset(ret);
          }
          else{
            //On passe l'import
          }
        }
      });
      if(this.EDIT_ID =="ascendance"){

      }
      this.saveLocal();
    });
  }

  charaLocalReset(context){
    if(context == "ascendance"){
      this.chara["ascendance"] = [];
      this.chara["ascendance-attr-boost"] = [];
        this.chara["ascendance-attr-boost"].push("--");
        this.chara["ascendance-attr-boost"].push("--");
        this.chara["ascendance-attr-boost"].push("--");
      this.chara["ascendance-attr-flaw"] = [];
        this.chara["ascendance-attr-flaw"].push("--");
    this.chara["heritage"] = [];
    }

    if(context == "historique"){
      this.chara["historique"] = [];
        this.chara["historique-attr-boost"] = [];
          this.chara["historique-attr-boost"].push("--");
          this.chara["historique-attr-boost"].push("--");
          this.chara["historique-attr-boost"].push("--");
    }
  }

  charaPostReset(context){
    if(context == 'ascendance'){
      this.loadJsonIntoCharacter('ancestries', 'ascendance' ,'_id' , false);

      const url = './assets/heritages.json';
      this._js.downloadFile(url).subscribe((data:any) => {
        this.chara["ascendance"]["heritages"] = [];
        data.forEach( heritage => {
          if(heritage["ancestryId"] == this.chara["ascendance"]["_id"]) this.chara["ascendance"]["heritages"].push(heritage);
        });
      });

    }
  }
  
  //======================================================


  loadLocal(){
    var cache = localStorage.getItem('cacheChara');
    if(cache != null){
      this.chara = JSON.parse(cache);
    }
    else{
      this.newLocal();
    }
  }

  newLocal(){
    this.chara = {};
      this.chara["_id"] =  this.guidGenerator();
      this.chara["name"] = "Nom du personnage";
      this.chara["ascendance"] = [];
        this.chara["ascendance-attr-boost"] = [];
          this.chara["ascendance-attr-boost"].push("--");
          this.chara["ascendance-attr-boost"].push("--");
          this.chara["ascendance-attr-boost"].push("--");
        this.chara["ascendance-attr-flaw"] = [];
          this.chara["ascendance-attr-flaw"].push("--");
      this.chara["heritage"] = [];
      this.chara["historique"] = [];
        this.chara["historique-attr-boost"] = [];
          this.chara["historique-attr-boost"].push("--");
          this.chara["historique-attr-boost"].push("--");
          this.chara["historique-attr-boost"].push("--");
      this.chara["classe"] = [];
    this.saveLocal();
  }

  saveLocal(){
    localStorage.setItem('cacheChara', JSON.stringify(this.chara));
  }

  //======================================================
  guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(18).substring(1);
    };
    return (S4()+"-"+S4()+S4());
  }

  getCurrentHeritageEffect(){
    var res ="Choisissez un héritage pour visualiser son effet.";
    if(!this.chara['ascendance']['heritages']) return res;
    this.chara['ascendance']['heritages'].forEach( herit => {
      if(herit['translations']['fr']['name'].includes(this.chara['heritage'])) res = herit['translations']['fr']['description']; 
    });
    return res
  }

  totalStat(attrib){
    var res = 0;
    if(this.chara['ascendance-attr-boost'][0] == attrib) res++;
    if(this.chara['ascendance-attr-boost'][1] == attrib) res++;
    if(this.chara['ascendance-attr-boost'][2] == attrib) res++;
    
    if(this.chara['historique-attr-boost'][0] == attrib) res++;
    if(this.chara['historique-attr-boost'][1] == attrib) res++;
    if(this.chara['historique-attr-boost'][2] == attrib) res++;
    
    if(this.chara['ascendance-attr-flaw'][0] == attrib) res--;
    return res;
  }
}
