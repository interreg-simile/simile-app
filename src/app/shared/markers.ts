import {Icon} from 'leaflet';

export function userMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/user-marker.png',
    iconRetinaUrl: 'assets/images/user-marker-2x.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function customMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/custom-marker.png',
    iconRetinaUrl: 'assets/images/custom-marker-2x.png',
    shadowUrl: 'assets/images/marker-shadow.png',
    iconSize: [25, 46],
    iconAnchor: [12.5, 46],
    shadowSize: [41, 41],
  });
}

export function userObservationMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/user-observation-marker.png',
    iconRetinaUrl: 'assets/images/user-observation-marker-2x.png',
    shadowUrl: 'assets/images/marker-shadow.png',
    iconSize: [25, 46],
    iconAnchor: [12.5, 46],
    shadowSize: [41, 41],
  });
}

export function observationMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/observation-marker.png',
    iconRetinaUrl: 'assets/images/observation-marker-2x.png',
    shadowUrl: 'assets/images/marker-shadow.png',
    iconSize: [25, 46],
    iconAnchor: [12.5, 46],
    shadowSize: [41, 41],
  });
}

export function fadedObservationMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/faded-observation-marker.png',
    iconRetinaUrl: 'assets/images/faded-observation-marker-2x.png',
    shadowUrl: 'assets/images/marker-shadow.png',
    iconSize: [25, 46],
    iconAnchor: [12.5, 46],
    shadowSize: [41, 41],
  });
}

export function eventMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/event-marker.png',
    iconRetinaUrl: 'assets/images/event-marker-2x.png',
    shadowUrl: 'assets/images/marker-shadow.png',
    iconSize: [25, 46],
    iconAnchor: [12.5, 46],
    shadowSize: [41, 41],
  });
}

export function alertMarkerIcon(): Icon {
  return new Icon({
    iconUrl: 'assets/images/alert-marker.png',
    iconRetinaUrl: 'assets/images/alert-marker-2x.png',
    shadowUrl: 'assets/images/marker-shadow.png',
    iconSize: [25, 46],
    iconAnchor: [12.5, 46],
    shadowSize: [41, 41],
  });
}
