import { Component } from '@angular/core';
import { JsonService } from '../json.service';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equips',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './equips.component.html',
  styleUrl: './equips.component.less'
})
export class EquipsComponent {
private rawData : any = null;
  public traitData : any = null;
  public data : any = null;

  public sortMode : string = "";
  public textFilter : string = "";


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
      element["grey"] = grey;
      grey = !grey;
      if(this.textFilter != ""){
        if(element["translations"]["fr"]["name"] && !element["translations"]["fr"]["name"].replaceAll('é', 'e').replaceAll('è', 'e').toUpperCase()
          .includes(this.textFilter.replaceAll('é', 'e').replaceAll('è', 'e').trim().toUpperCase())){ 
          grey = !grey;
          element["hidden"] = true;
        }
      }
      // else if((element['range'] == null && !this.filterCac)
      //   ||(element['range'] != null && !this.filterDist)
      //   ||(element['category'] == 'simple' && !this.filterSimp)
      //   ||(element['category'] == 'martial' && !this.filterMart)
      //   ||(element['category'] == 'advanced' && !this.filterAdv)
      // ){
      //   grey = !grey;
      //   element["hidden"] = true;
      // }
    });
  }
  
}

