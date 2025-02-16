import { Component } from '@angular/core';
import { JsonService } from '../json.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-armors',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './armors.component.html',
  styleUrl: './armors.component.less'
})
export class ArmorsComponent {
  private rawData : any = null;
  public traitData : any = null;
  public data : any = null;

  public sortMode : string = "";
  public textFilter : string = "";
  public forFilter : string = "null";

  public filterUna : boolean = true;
  public filterLig : boolean = true;
  public filterMed : boolean = true;
  public filterHea : boolean = true;

  constructor(private _js: JsonService){
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

      const url = './assets/equipment.json';
      this._js.downloadFile(url).subscribe((data:any) => {
        this.rawData = data;
        this.sortMode = "nom_asc";
        this.filterRawData();
        this.rawData = this.data;
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
          if(element["damage"] && element["damage"]["damageType"]){
            element["damageTypeFR"] = this.getTranslatedTrait(element["damage"]["damageType"]);
          }
          element["hidden"] = false;
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
      case 'ca':{
        aCompare = a['acBonus'];
        bCompare = b['acBonus'];
        break;
      }
      case 'dex':{
        aCompare = a['dexCap'];
        bCompare = b['dexCap'];
        break;
      }
      case 'force':{
        aCompare = a['strength'];
        bCompare = b['strength'];
        break;
      }
      case 'poids':{
        aCompare = a['bulk'];
        bCompare = b['bulk'];
        break;
      }
      case 'pen':{
        aCompare = -a['checkPenalty'];
        bCompare = -b['checkPenalty'];
        break;
      }
      case 'categorie':{
        var comp = [];
        comp['unarmored'] = 0; comp['light'] = 1; comp['medium']=2; comp['heavy']=3
        aCompare = comp[a['category']];
        bCompare = comp[b['category']];
      }
    }

    if(aCompare > bCompare) return 1*mod;
    if(aCompare < bCompare) return -1*mod;
    return 1;
  }

  isElementDisplayed(element) : boolean{
    if(element["translations"] == null) return false;
    if(element["translations"]["fr"] == null) return false;
    if(element["type"] != "armor") return false;
    if(element["level"] > 1) return false;
    if(element["publication"].includes("Starfinder")) return false;
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
      element["grey"] = grey;
      grey = !grey;
      if(this.textFilter != ""){
        if(element["translations"]["fr"]["name"] && !element["translations"]["fr"]["name"].normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').toUpperCase()
          .includes(this.textFilter.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').trim().toUpperCase())){ 
          grey = !grey;
          element["hidden"] = true;
        }
      }
      else if(
          (element['category'] == 'unarmored' && !this.filterUna)
        ||(element['category'] == 'light' && !this.filterLig)
        ||(element['category'] == 'light-barding' && !this.filterLig)
        ||(element['category'] == 'medium' && !this.filterMed)
        ||(element['category'] == 'heavy' && !this.filterHea)
      ){
        grey = !grey;
        element["hidden"] = true;
      }
      else if(this.forFilter != null && this.forFilter !== "0"){
        if(element["strength"] > this.forFilter){ 
          grey = !grey;
          element["hidden"] = true;
        }
      }
    });
  }
  
}
