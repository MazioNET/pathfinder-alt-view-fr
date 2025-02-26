import { Routes } from '@angular/router';
import { WeaponsComponent } from './dataView/weapons/weapons.component';
import { ArmorsComponent } from './dataView/armors/armors.component';
import { EquipsComponent } from './dataView/equips/equips.component';
import { SpellsComponent } from './dataView/spells/spells.component';
import { BuilderComponent } from './builder/builder.component';
import { AncestriesComponent } from './dataView/ancestries/ancestries.component';
import { FeatAncestryComponent } from './dataView/feat-ancestry/feat-ancestry.component';
import { BackgroundComponent } from './dataView/background/background.component';
import { ClassesComponent } from './dataView/classes/classes.component';
import { FeatClassComponent } from './dataView/feat-class/feat-class.component';
import { FeatGeneralComponent } from './dataView/feat-general/feat-general.component';
import { FeatSkillsComponent } from './dataView/feat-skills/feat-skills.component';

export const routes: Routes = [

    {path: "builder", component: BuilderComponent},

    {path: "ancestries", component: AncestriesComponent},
    {path: "feats/ancestries", component: FeatAncestryComponent},
    {path: "backgrounds", component: BackgroundComponent},

    {path: "classes", component: ClassesComponent},
    {path: "feats/general", component: FeatGeneralComponent},
    {path: "feats/classes", component: FeatClassComponent},
    {path: "feats/skills", component: FeatSkillsComponent},
    {path: "spells", component: SpellsComponent},

    {path: "weapons", component: WeaponsComponent},
    {path: "armors", component: ArmorsComponent},
    {path: "equips", component: EquipsComponent},



    { path: '**', redirectTo: "builder" }
];
