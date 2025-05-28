import { OnInit, Pipe, PipeTransform } from '@angular/core';
import { StorageType } from '../enums/storage-type';
import { SessionService } from '../services/session.service';

@Pipe({ name: 'textDescription' })
export class TextDescription implements PipeTransform {
  constructor(private _session: SessionService) { }

  transform(value, isKeyValueHtml = true) {
    let data = this._session.get('clientConfig', StorageType.Session)?.filter(configObj => {
      return configObj['settingKey'] === value;
    });

    if(!data){
      return null;
    }
    
    let val = '';
    if (isKeyValueHtml) {
      val =  data[0]?.keyValueHtml;
    } else {
      val = data[0]?.keyValue;
    }
    if(!val){
      return null;
    }
    val = val.replace('[current_year]',(new Date()).getFullYear().toString());
    return val;
  }
}
