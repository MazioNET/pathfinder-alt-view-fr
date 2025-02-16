import { Component } from '@angular/core';
import { JsonService } from '../json.service';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-spells',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './spells.component.html',
  styleUrl: './spells.component.less'
})
export class SpellsComponent {
  private rawData : any = null;
  public traitData : any = null;
  public data : any = null;

  public sortMode : string = "";
  public textFilter : string = "";
  public minFilter : any = 1;
  public maxFilter : any = 10;

  public filterSor : boolean = true;
  public filterFoc : boolean = true;
  public filterMin : boolean = true;

  public tradFilter :string = "";

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

      const url = './assets/spells.json';
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
          element["traits"]["traditions"].forEach( trad=>{element[trad] = true;});
          if(element["traits"]["traditions"].length == 0) element["special"]= true;
          element["damageTypeFR"] = []

          if(element["damage"]){
            var n = 0;
            while(element["damage"][n]){
              var translatedTrait = this.getTranslatedTrait(element["damage"][n]["type"])
              var alreadyAdded = false;
              element["damageTypeFR"].forEach(type => {
                if(type["name"] == translatedTrait["name"]) alreadyAdded = true;   
              });
              if(!alreadyAdded)element["damageTypeFR"].push(translatedTrait);
              n++;
            }
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
      case 'lvl':{
        aCompare = a['level'];
        bCompare = b['level'];
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
      // vvv Appliquer le trait cantrip et focus vvv
      if(translatedTrait && translatedTrait['translations']['fr']['name'] == "Tour de magie") element["cantrip"] = true;
      else if(translatedTrait && translatedTrait['translations']['fr']['name'] == "Focalisé") element["focus"] = true;
      else if(translatedTrait) res.push(translatedTrait);
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
    var effMin = 1;
    var effMax = 10;
    var isMinNull = (this.minFilter === null );
    if(!isMinNull){
      if(+this.minFilter < 1) effMin=1;
      else if(+this.minFilter > 10) effMin=10;
      else effMin=+this.minFilter;
    }  
    var isMaxNull = (this.maxFilter === null );
    if(!isMaxNull){
      if(+this.maxFilter < 1) effMax=1;
      else if(+this.maxFilter > 10) effMax=10;
      else effMax=+this.maxFilter;
    } 

    //Swap if B<A
    if(effMax < effMin){
      var tempeff = effMin;
      effMin = effMax;
      effMax = tempeff;
    }
    this.minFilter = ""+effMin;
    this.maxFilter = ""+effMax;

    var grey = false;
    this.data.forEach( element => {
      element["hidden"] = false;
      element["grey"] = grey;
      grey = !grey;
      if( this.textFilter != "" && element["translations"]["fr"]["name"] && !element["translations"]["fr"]["name"].normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').toUpperCase()
        .includes(this.textFilter.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').trim().toUpperCase())){ 
        grey = !grey;
        element["hidden"] = true; 
      }
      else if(this.tradFilter != "" && !element[this.tradFilter]){ 
        grey = !grey;
        element["hidden"] = true;
      }
      else if(element['level'] < this.minFilter
        || element['level'] > this.maxFilter
      ){
        grey = !grey;
        element["hidden"] = true;
      }
      else if(
          (!element['focus'] && !element['cantrip'] && !this.filterSor)
        ||(element['cantrip'] && !this.filterMin)
        ||(element['focus'] && !this.filterFoc)
      ){
        grey = !grey;
        element["hidden"] = true;
      }
      
    });
  }
}
