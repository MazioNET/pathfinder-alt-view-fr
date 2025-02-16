import { NgForOf, NgIf, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonService } from '../json.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ancestries',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './ancestries.component.html',
  styleUrl: './ancestries.component.less'
})
export class AncestriesComponent {  

  private rawData : any = null;
  private heritData : any = null;
  public traitData : any = null;
  public data : any = null;

  public sortMode : string = "";
  public textFilter : string = "";

  public filterCom: boolean = true;
  public filterUncom: boolean = true;
  public filterRar: boolean = true;

  public htmlImg: string = 
    "<img height=\"250px\" "+
    "src=\"https://2e.aonprd.com/Images/Ancestries/[NAME]01.webp\" alt=\"\">"+
    "<img height=\"250px\"  "+
    "src=\"https://2e.aonprd.com/Images/Ancestries/[NAME]01.png\" alt=\"\">"+
    "<img height=\"250px\" "+
    "src=\"https://2e.aonprd.com/Images/Ancestries/[NAME]02.webp\" alt=\"\">"+
    "<img height=\"250px\"  "+
    "src=\"https://2e.aonprd.com/Images/Ancestries/[NAME]02.png\" alt=\"\">";


  constructor(private _js: JsonService, public router: Router){
    this.downloadJson();
  }

  goToLink(url: string){
    window.open(url, "_blank");
  }

  downloadJson() {
    const url = './assets/traits.json';
    this._js.downloadFile(url).subscribe((data:any) => {
      this.traitData = data;
      //console.log(this.traitData);

      const url = './assets/heritages.json';
      this._js.downloadFile(url).subscribe((data:any) => {
        this.heritData = data;
        
      //console.log(this.heritData);

        const url = './assets/ancestries.json';
        this._js.downloadFile(url).subscribe((data:any) => {
        this.rawData = data;
        this.sortMode = "nom_asc";
        this.filterRawData();
        this.rawData = this.data;
      });
      });
    });
  }
  
  filterRawData(){
    this.data = [];
    if(this.rawData != null){
      this.rawData.forEach( element => {
        if(this.isElementDisplayed(element)){
          //EDIT DATE HERE 
          element["traits"]["value"] = this.translateTraits(element);
          element["hidden"] = false;

          element["bonus"] = [];
          element["bonus"].push(element["boosts"]["0"]["0"]);
          element["bonus"].push(element["boosts"]["1"]["0"]);
          if(element["boosts"]["2"]) element["bonus"].push(element["boosts"]["2"]["0"]);
          element["malus"] = [];
          if(element["flaws"]["0"]) element["malus"].push(element["flaws"]["0"]["0"]);

          element["heritages"] = [];
          this.heritData.forEach( heritage => {
            if(heritage["ancestryId"] == element["_id"]) element["heritages"].push(heritage);
          });

          element["img"] = this.htmlImg.replaceAll("[NAME]",element['name'].replaceAll(' ','_'));
          //DATA EDITING ENDS HERE
          this.data.push(element);
        }
      });
      this.sortData();
      //console.log(this.data);
    }
  }

  sortData(){
    this.data.sort(this.compare.bind(this));
    this.dynamicFilter();
  }

  compare(a, b){
    let aCompare = 0;
    let bCompare = 0;

    let mod = 1;
    if(this.sortMode.split("_")[1] == "desc") mod = -1;

    switch(this.sortMode.split('_')[0]){
      case 'nom':{
        aCompare = a["translations"]["fr"]["name"].normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '');
        bCompare = b["translations"]["fr"]["name"].normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '');
        break;
      }
      case 'pv':{
        aCompare = a["hp"];
        bCompare = b["hp"];
        break;
      }
      case 'mag':{
        aCompare = a["spellcasting"];
        bCompare = b["spellcasting"];
        break;
      }
    }

    if(aCompare > bCompare) return 1*mod;
    if(aCompare < bCompare) return -1*mod;
    return 1;
  }

  isElementDisplayed(element) : boolean{
    if(element["translations"] == null) return false;
    if(element["translations"]["fr"] == null) return false;
    if(element["type"] == "armor") return false;
    if(element["type"] == "weapon") return false;
    if(element["level"] > 0) return false;
    if(!element["publication"] || element["publication"].includes("Starfinder")) return false;
    return true;
  }

  translateTraits(element){
    var res : string[] = [];
   
    element["traits"]["value"].forEach( trait =>{
      var translatedTrait = this.getTranslatedTrait(trait.replaceAll("-",""));
      if(translatedTrait && !translatedTrait['translations']['fr']['description']){
        var split = this.getTranslatedTrait(trait.split("-")[0]);
        if(split && split['translations']) {
          translatedTrait['translations']['fr']['description'] = split['translations']['fr']['description'];
        }
      }
      if(translatedTrait) res.push(translatedTrait);
    });
    return res;
  }

  getTranslatedTrait(trait){
    if(this.traitData[trait] != null && this.traitData[trait]["translations"]["fr"] != null){
      return (this.traitData[trait]);
    } 
  }

  changeSortMode(mode : string){
    if(this.sortMode.split('_')[0] == mode){
      if(this.sortMode.split('_')[1] == "asc") 
        this.sortMode = this.sortMode.replaceAll("asc","desc");
      else this.sortMode = this.sortMode.replaceAll("desc","asc");
    }
    else{
      this.sortMode = mode + "_asc";
    }
    this.sortData();
  }

  dynamicFilter(){
    var grey = false;
    this.data.forEach( element => {
      element["hidden"] = false;
      element["selected"] = false;
      element["grey"] = grey;
      grey = !grey;
      if(this.textFilter != "" && element["translations"]["fr"]["name"] && !element["translations"]["fr"]["name"].replaceAll('é', 'e').replaceAll('è', 'e').toUpperCase()
        .includes(this.textFilter.replaceAll('é', 'e').replaceAll('è', 'e').trim().toUpperCase())){ 
        grey = !grey;
        element["hidden"] = true;
        
      }
      else if(
          (element['traits']['rarity'] == 'common' && !this.filterCom)
        ||(element['traits']['rarity'] == 'uncommon' && !this.filterUncom)
        ||(element['traits']['rarity'] == 'rare' && !this.filterRar)
      ){
        grey = !grey;
        element["hidden"] = true;
      }
    });
  }
  
  //-----------------

  editSelected : any = [];
  public EDIT_MODE = new URL(window.location.href).searchParams.get('edit');
  public EDIT_ID = new URL(window.location.href).searchParams.get('id');
  toggleSelected(object){
    console.log(this.editSelected);
    console.log(object['_id'])
    if(object['selected']){
      object['selected'] = false;
      this.editSelected = this.editSelected.filter((item) => { return item != ("" + object['_id'])});
    }
    else{
      object['selected'] = true;
      this.editSelected.push(object['_id']);
    }
    
    console.log(this.editSelected)
  }

  confirm(){
    this.router.navigate(['/builder'],{queryParams: {'return': this.editSelected , 'id': this.EDIT_ID}});
  }
}

