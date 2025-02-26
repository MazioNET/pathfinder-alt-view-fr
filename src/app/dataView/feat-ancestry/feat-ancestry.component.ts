import { Component } from '@angular/core';
import { JsonService } from '../json.service';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feat-ancestry',
  standalone: true,
  imports: [NgForOf, NgIf, NgClass, FormsModule],
  templateUrl: './feat-ancestry.component.html',
  styleUrl: './feat-ancestry.component.less'
})
export class FeatAncestryComponent {

  private ID :any = new URL(window.location.href).searchParams.get('id');

  private rawData : any = null;
  public traitData : any = null;
  public ancestryData : any = null;
  public data : any = null;

  public sortMode : string = "";
  public textFilter : string = "";
  public ancFilter : string = (this.ID && this.ID.split(':')[1] ? this.ID.split(':')[1]:"");

  public minFilter : any = 1;
  public maxFilter : any = (this.ID && this.ID.split('-')[1].split(':')[0] ? this.ID.split('-')[1].split(':')[0]:20);


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
      
      const url = './assets/ancestries.json';
      this._js.downloadFile(url).subscribe((data:any) => {
        this.ancestryData = data;

        const url = './assets/feats.json';
        this._js.downloadFile(url).subscribe((data:any) => {
          this.rawData = data;
          this.sortMode = "nom_asc";
          this.filterRawData();
          this.rawData = this.data;
          console.log(this.data);
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
        
          element["ancestry"] = "";

          element["traits"]["value"].forEach( t =>{
            this.ancestryData.forEach(a =>{
              if(a['name'] == t['name']) element["ancestry"] = a['translations']['fr']['name'];
            });
          });


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
      case 'ans':{
        aCompare = a['ancestry'];
        bCompare = b['ancestry'];
        break;
      }
    }

    if(aCompare > bCompare) return 1*mod;
    if(aCompare < bCompare) return -1*mod;
    return 1;
  }

  isElementDisplayed(element) : boolean{
    if(element["category"] != 'ancestry') return false;
    if(element["translations"] == null) return false;
    if(element["translations"]["fr"] == null) return false;
    
    if(element["publication"] && element["publication"].includes("Starfinder")) return false;
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
    return trait;
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
    var effMax = 20;
    var isMinNull = (this.minFilter === null );
    if(!isMinNull){
      if(+this.minFilter < 1) effMin=1;
      else if(+this.minFilter > 20) effMin=20;
      else effMin=+this.minFilter;
    }  
    var isMaxNull = (this.maxFilter === null );
    if(!isMaxNull){
      if(+this.maxFilter < 1) effMax=1;
      else if(+this.maxFilter > 20) effMax=20;
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
      if(element["ancestry"] == ""){
        grey = !grey;
        element["hidden"] = true; 
      }
      if( this.textFilter != "" && element["translations"]["fr"]["name"] && !element["translations"]["fr"]["name"].normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').toUpperCase()
        .includes(this.textFilter.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').trim().toUpperCase())){ 
        grey = !grey;
        element["hidden"] = true; 
      }
      else if( this.ancFilter != "" && element["ancestry"] && !element["ancestry"].normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').toUpperCase()
        .includes(this.ancFilter.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '').trim().toUpperCase())){ 
        grey = !grey;
        element["hidden"] = true; 
      }
      else if(element['level'] < this.minFilter
        || element['level'] > this.maxFilter
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
    public EDIT_NB = 1;
    public EDIT_LVL = (new URL(window.location.href).searchParams.get('id')?.includes('spell') ?
    new URL(window.location.href).searchParams.get('id')?.split('-')[2] :
      -1
    );


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
