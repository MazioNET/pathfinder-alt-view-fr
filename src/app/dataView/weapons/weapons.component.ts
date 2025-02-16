import { Component } from '@angular/core';
import { JsonService } from '../json.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { NgModel } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [ NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './weapons.component.html',
  styleUrl: './weapons.component.less'
})


export class WeaponsComponent {
  private rawData : any = null;
  public traitData : any = null;
  public data : any = null;

  public sortMode : string = "";
  public textFilter : string = "";

  public filterCac : boolean = true;
  public filterDist : boolean = true;

  public filterSimp : boolean = true;
  public filterMart : boolean = true;
  public filterAdv : boolean = true;

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
      case 'type':{
        aCompare = a['range'];
        bCompare = b['range'];
        break;
      }
      case 'degats':{
        aCompare = Number(a["damage"]["die"].replaceAll("d",""));
        bCompare = Number(b["damage"]["die"].replaceAll("d",""));
        break;
      }
      case 'mains':{
        aCompare = a['usage'];
        bCompare = b['usage'];
        break;
      }
      case 'poids':{
        aCompare = a['bulk'];
        bCompare = b['bulk'];
        break;
      }
      case 'groupe':{
        break;
      }
      case 'categorie':{
        aCompare = a['category'];
        bCompare = b['category'];
        mod = mod*-1; //Dans cet ordre pour cause de gameplay
      }
    }

    if(aCompare > bCompare) return 1*mod;
    if(aCompare < bCompare) return -1*mod;
    return 1;
  }

  isElementDisplayed(element) : boolean{
    if(element["translations"] == null) return false;
    if(element["translations"]["fr"] == null) return false;
    if(element["type"] != "weapon") return false;
    if(element["level"] > 0) return false;
    if(element["publication"].includes("Starfinder")) return false;
    return true;
  }

  translateTraits(element){
    var res : string[] = [];
    if(element["reload"] && element["reload"] != 0 && element["reload"] != '-'){
      element["traits"]["value"].push("reload-"+element["reload"]);
    }
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
      else if((element['range'] == null && !this.filterCac)
        ||(element['range'] != null && !this.filterDist)
        ||(element['category'] == 'simple' && !this.filterSimp)
        ||(element['category'] == 'martial' && !this.filterMart)
        ||(element['category'] == 'advanced' && !this.filterAdv)
  ){
      grey = !grey;
      element["hidden"] = true;
  }
    });
  }
}
