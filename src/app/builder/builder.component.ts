import { NgForOf, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JsonService } from '../dataView/json.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  public JDS = {'reflex':'Réflexes', 'fortitude':'Vigueur', 'will':'Volonté'};
  public ATTAQUES = {'unarmed':'Sans armes','simple':'Simples','martial':'De guerre','advanced':'Avancées'};
  public DEFENSES = {'unarmored':'Sans Armure','light':'Légères','medium':'Moyenne','heavy':'Lourdes'};
  public COMPETENCES = {'acrobatics':'Acrobaties','arcana':'Arcanes','crafting':'Artisanat','athletics':'Athlétisme',
    'diplomacy':'Diplomatie','stealth':'Discrétion','deception':'Duperie','intimidation':'Intimidation',
    'thievery':'Larcin','medecine':'Medecine','nature':'Nature','occultism':'Occultisme','religion':'Religion',
    'performance':'Représentation','society':'Société','survival':'Survie'};



  public EDIT_RETURN = new URL(window.location.href).searchParams.get('return');
  public EDIT_ID = new URL(window.location.href).searchParams.get('id');

  constructor(private _js: JsonService, public router: Router, private sanitizer: DomSanitizer){
    this.loadLocal();
    addEventListener("beforeunload", (event) => { this.saveLocal()});
    router.events.subscribe((val) => {this.saveLocal()});

    if(this.EDIT_RETURN){
      if(this.EDIT_ID == 'ascendance'){
        this.loadJsonIntoCharacter('ancestries', 'ascendance' ,'_id' , false);
      }

      if(this.EDIT_ID == 'historique'){
        this.loadJsonIntoCharacter('backgrounds', 'historique' ,'_id' , false);
      }

      if(this.EDIT_ID == 'classe'){
        this.loadJsonIntoCharacter('classes', 'classe' ,'_id' , false);
      }
      if(this.EDIT_ID?.includes('spell')){
        this.loadSpellsIntoCharacter();
      }
      if(this.EDIT_ID?.includes('feat_ascendance')){
        this.loadAscendanceFeatIntoCharacter();
      }
      if(this.EDIT_ID?.includes('feat_class')){
        this.loadClassFeatIntoCharacter();
      }
      if(this.EDIT_ID?.includes('feat_general')){
        this.loadGeneralFeatIntoCharacter();
      }
      if(this.EDIT_ID?.includes('feat_competence')){
        this.loadCompetenceFeatIntoCharacter();
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

  editClasse(){
    this.router.navigate(['/classes'],{queryParams: {'edit': true, 'id':'classe'}});
  }

  editSpells(context){
    this.router.navigate(['/spells'],{queryParams: {'edit': true, 'id':context['type'].replaceAll(" ","-") + "-" + context['spellId'] + "-" + context['tradition']}});
  }

  editAscFeats(context){
    this.router.navigate(['/feats/ancestries'],{queryParams: {'edit': true, 'id':context + ':' + this.chara['ascendance']['translations']['fr']['name']}});
  }

  editClassFeats(context){
    this.router.navigate(['/feats/classes'],{queryParams: {'edit': true, 'id':context + ':' + this.chara['classe']['translations']['fr']['name']}});
  }

  editGeneralFeats(context){
    this.router.navigate(['/feats/general'],{queryParams: {'edit': true, 'id':context }});
  }

  editCompetenceFeats(context){
    this.router.navigate(['/feats/skills'],{queryParams: {'edit': true, 'id':context }});
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
      this.saveLocal();
    });
  }

  loadSpellsIntoCharacter(){
    const url = './assets/spells.json';
    var spellInstanceId = this.EDIT_ID?.split('-')[3];
    var idArray = this.EDIT_RETURN?.split('-');
    idArray?.pop();

    //console.log(idArray);

    this._js.downloadFile(url).subscribe((data:any) => {
      var spellArray : any = [];
      //Chargement des choix dans l'array
      data.forEach( spell => {
        idArray?.forEach(id => {
          if(spell['_id'] == id) spellArray.push(spell);
        });
      });

      //Chargement de l'array dans la classe
      for(let n=1; n<= 20; n++){
        this.chara['classe-aptitudes'][n].forEach( level =>{
          if(level["spellId"] && level["spellId"] == spellInstanceId){
            level["spell-choix"] = spellArray;
          }
        });
      }
      this.saveLocal();
    });
  }

  loadAscendanceFeatIntoCharacter(){
    const url = './assets/feats.json';

    this._js.downloadFile(url).subscribe((data:any) => {
      data.forEach( f =>{ 
        if(this.EDIT_RETURN?.includes(f['_id'])) this.chara['ascendance-dons'][this.EDIT_ID?.split('-')[1].split(':')[0] + ''] = f;
       })
      this.saveLocal();
    });
  }

  loadClassFeatIntoCharacter(){
    const url = './assets/feats.json';

    this._js.downloadFile(url).subscribe((data:any) => {
      data.forEach( f =>{ 
        if(this.EDIT_RETURN?.includes(f['_id'])) this.chara['classe-dons'][this.EDIT_ID?.split('-')[1].split(':')[0] + ''] = f;
       })
      this.saveLocal();
    });
  }

  loadGeneralFeatIntoCharacter(){
    const url = './assets/feats.json';

    this._js.downloadFile(url).subscribe((data:any) => {
      data.forEach( f =>{ 
        if(this.EDIT_RETURN?.includes(f['_id'])) this.chara['general-dons'][this.EDIT_ID?.split('-')[1].split(':')[0] + ''] = f;
       })
      this.saveLocal();
    });
  }

  loadCompetenceFeatIntoCharacter(){
    const url = './assets/feats.json';

    this._js.downloadFile(url).subscribe((data:any) => {
      data.forEach( f =>{ 
        if(this.EDIT_RETURN?.includes(f['_id'])) this.chara['competence-dons'][this.EDIT_ID?.split('-')[1].split(':')[0] + ''] = f;
       })
      this.saveLocal();
    });
  }

  charaLocalReset(context){
    if(context == "ascendance"){
      this.chara["ascendance"] = [];
        this.chara["ascendance-dons"] = {};
        this.chara["ascendance-attr-boost"] = this.forEmpty(3);
        this.chara["ascendance-attr-flaw"] = this.forEmpty(1);
        this.chara["heritage"] = [];
    }

    if(context == "historique"){
      this.chara["historique"] = [];
        this.chara["historique-connaissance"] = [];
        this.chara["historique-attr-boost"] = this.forEmpty(3);
    }

    if(context == "classe"){
      this.chara["classe"] = [];
        this.chara["classe-dons"] = {};
        this.chara['classe-competences']="";
          this.chara['classe-competences-choix'] = this.forEmpty(20);
        this.chara["classe-aptitudes"]=[];
        this.chara["classe-attr-boost"] = this.forEmpty(5);
        this.chara["competence-dons"] = {};
        this.chara["general-dons"] = {};
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
        this.chara["ascendance-dons"] = {'1':{}}
        this.saveLocal();
      });
    }

    if(context == 'classe'){
      const url = './assets/class-features.json';
      this._js.downloadFile(url).subscribe((data:any) => {
        if(data[this.chara['classe']['translations']['fr']['name']]){
          this.chara["classe-aptitudes"] = data[this.chara['classe']['translations']['fr']['name']];
        }
        this.saveLocal();
      });

      this.chara['classe-competences'] =  Array.from(this.chara['classe']['description'].split('Trained in a number of additional skills equal to ')[1])[0];
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

  //-- INIT HERE --
  newLocal(){
    this.chara = {};
      this.chara["_id"] =  this.guidGenerator();
      this.chara["name"] = "Nom du personnage";
      this.chara["level"] = 1;
      this.chara["ascendance"] = [];
        this.chara["ascendance-dons"] = {};
        this.chara["ascendance-attr-boost"] = this.forEmpty(3);
        this.chara["ascendance-attr-flaw"] = this.forEmpty(1);
      this.chara["heritage"] = [];
      this.chara["historique"] = [];
        this.chara["historique-connaissance"] = [];
        this.chara["historique-attr-boost"] = this.forEmpty(3);
      this.chara["classe"] = [];
      this.chara["classe-dons"] = {};
      this.chara['classe-competences'] = "";
      this.chara['classe-competences-choix'] = this.chara['classe-competences-choix'] = this.forEmpty(20);
        this.chara["classe-aptitudes"] = "";
        this.chara["classe-attr-boost"] = this.forEmpty(5);
        this.chara["competences-dons"] = {};
      this.chara["general-dons"] = {};
      this.chara["budget"] = 1500;
    this.saveLocal();
  }

  saveLocal(){
    localStorage.setItem('cacheChara', JSON.stringify(this.chara));
  }

  //======================================================

  loadFile($file){
    var upload = $file.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(upload, "UTF-8");
    fileReader.onload = () => {
      this.chara = JSON.parse(fileReader.result+'');
      this.saveLocal();
    }

  }

  saveFile(){
    var theJSON = JSON.stringify(this.chara);
        var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
       var downloadJsonHref = uri;
    return downloadJsonHref;

  }

  //======================================================
  guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(18).substring(1);
    };
    return (S4()+"-"+S4()+S4());
  }

  public forJSON = Object.keys;

  forN(n){
    var ret : any = [];
    for(let i=0; i<n; i++) ret.push(i);
    return ret;
  }

  forEmpty(n){
    var ret : any = [];
    for(let i=0; i<n; i++) ret.push("--");
    return ret;
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

    
    if(this.chara['classe-attr-boost'][0] == attrib) res++;
    if(this.chara['classe-attr-boost'][1] == attrib) res++;
    if(this.chara['classe-attr-boost'][2] == attrib) res++;
    if(this.chara['classe-attr-boost'][3] == attrib) res++;
    if(this.chara['classe-attr-boost'][4] == attrib) res++;
    
    if(this.chara['ascendance-attr-flaw'][0] == attrib) res--;
    return res;
  }

  totalSkill(skill){
    var ret = 0;
    if(this.chara["historique"]["trainedSkills"] 
      && this.chara["historique"]["trainedSkills"].indexOf(skill) != -1){
        ret = Math.max(ret,1);
      }
    if(this.chara["classe"]["trainedSkills"] 
      && this.chara["classe"]["trainedSkills"].indexOf(skill) != -1){
        ret = Math.max(ret,1);
      }
    if(this.chara["classe"]["trainedSkills"] 
      && this.chara["classe-competences-choix"].indexOf(skill) != -1
      && this.chara["classe-competences-choix"].indexOf(skill)
       < +this.chara['classe-competences'] + this.totalStat('Intelligence')){
        ret = Math.max(ret,1);
      }
    return ret;
  }

  totalSave(save){
    if(!this.chara['classe']['translations']) return 0;
    return this.chara['classe']['savingThrows'][save];
  }

  totalAttack(save){
    if(!this.chara['classe']['translations']) return 0;
    return this.chara['classe']['attacks'][save];
  }

  totalDefense(save){
    if(!this.chara['classe']['translations']) return 0;
    return this.chara['classe']['defenses'][save];
  }

  totalPerception(){
    if(!this.chara['classe']['translations']) return 0;
    return this.chara['classe']['perception'];
  }

}
