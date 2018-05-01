import { pg } from '../connectors';

export class Schema {

  static allTypes() {
    return pg
      .query('select distinct parent from schema order by parent;')
      .then(res => res.rows);
  }

}
