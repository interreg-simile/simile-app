import {LatLng} from 'leaflet';
import {Link} from '../common/link.model';

export interface Alert {
  id: string;
  title: string;
  content: string;
  coordinates?: LatLng;
  links?: Array<Link>;
  dateEnd: Date;
  read: boolean;
  createdAt: Date;
}
