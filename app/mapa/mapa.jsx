import React, { useRef, useState, useEffect } from 'react';
import { Autocomplete, DrawingManager, GoogleMap, Polygon, useJsApiLoader, Polyline } from '@react-google-maps/api';
import { IniciarFirebase } from '../firebase/config';
import { getFirestore, collection, addDoc,  getDocs, onSnapshot, query } from 'firebase/firestore';

import { addDays } from 'date-fns';
import  DateRangeSimple  from './fecha'; 



const libraries = ['places', 'drawing'];
const app = IniciarFirebase();
const firestore = getFirestore(app);





const MapComponent = () => {
    //Pagina de carga
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 3000)
      }, []);

 
      //Dentro o fuera del rango de fechas
    const [insideValue, setInsideValue] = useState(false); 

      //Rangos de fechas
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: addDays(new Date(), 7),
    });


    //Determinar si se encuentra dentro del rango de fechas gracias a "inside"
    const InsideChange = (newDateRange) => {
        setDateRange(newDateRange)
        const current = new Date().getTime
        const inside = current >= newDateRange.startDate && current <= newDateRange.endDate;
        setInsideValue(inside)
    }
  







   //Obtiene los documentos que contienen coordenadas las cuales forman una ruta utilizando polylines
   //Cada documento corresponde a un array ingresado anteriomente desde la app movil
    const [documentPolylines, setDocumentPolylines] = useState([]);

    useEffect(() => {
        const fetchCoords = async () => {
            const firestore = getFirestore();
            const querySnapshot = await getDocs(collection(firestore, 'regis'));
            const documentPolylines = [];

            const startDate= dateRange.startDate
            const endDate= dateRange.endDate

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                const polylinePoints = []

                if (data.coords && data.timestamp) {
                    const timestamp =  data.timestamp.toDate()

                    if(timestamp >= startDate && timestamp <= endDate){
                       
                        data.coords.forEach((coord) => {
                        const latitude = coord.latitude;
                        const longitude = coord.longitude;

                        polylinePoints.push({
                            lat: latitude,
                            lng: longitude,
                        });
                    });

                    documentPolylines.push(polylinePoints);
                 
                    }
                    
                }
               
            });

            setDocumentPolylines(documentPolylines);
        };

        fetchCoords();
    }, [insideValue, dateRange]);






    const mapRef = useRef();
    const polygonRefs = useRef([]);
    const activePolygonIndex = useRef();
    const autocompleteRef = useRef();
    const drawingManagerRef = useRef();


    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyDbmOcgobATYt47dfCW9diDNXXbHN1QU10',
        libraries
    });



    const [polygons, setPolygons] = useState([]);

 //Obtiene los poligonos de la colección polygon y se ingresan a un array para seguidamente leerlo y visualizar los poligonos en el mapa
    useEffect(() => {
        const q = query(collection(firestore, 'polygon'));
    
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const polygonsList = [];
                snapshot.forEach((doc) => {
                    const polygonData = doc.data().polygon;
                    const polygonPoints = polygonData.map((point) => ({
                        lat: point.latitude,
                        lng: point.longitude,
                    }));
                    polygonsList.push(polygonPoints);
                });
                setPolygons(polygonsList);
            }
        );
    
        return () => unsubscribe();
    }, []);
    
    
    
    //localización de inicio
      
    const defaultCenter = {
        lat: -36.809459,
        lng: -72.994755,
    }
    const [center, setCenter] = useState(defaultCenter);

    const containerStyle = {
        width: '163%',
        height: '850px',
      
    }

    const autocompleteStyle = {
        boxSizing: 'border-box',
        border: '1px solid transparent',
        width: '240px',
        height: '38px',
        padding: '0 12px',
        borderRadius: '3px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        fontSize: '14px',
        outline: 'none',
        textOverflow: 'ellipses',
        position: 'absolute',
        right: '8%',
        top: '11px',
        marginLeft: '-120px',
    }

    //Estilo y cualidades del poligono
    const polygonOptions = {
        fillOpacity: 0.3,
        fillColor: '#ff0000',
        strokeColor: '#ff0000',
        strokeWeight: 2,
        draggable: false,
        editable: false
    }
    //modos de dibujo
    const drawingManagerOptions = {
        polygonOptions: polygonOptions,
        drawingControl: true,
        drawingControlOptions: {
            position: typeof window !== 'undefined' ? window.google?.maps?.ControlPosition?.TOP_CENTER : null,
      drawingModes: [
        
        typeof window !== 'undefined' ? window.google?.maps?.drawing?.OverlayType?.POLYGON : null
        
      ]
        }
    }

    const onLoadMap = (map) => {
        mapRef.current = map;
    }

    const onLoadPolygon = (polygon, index) => {
        polygonRefs.current[index] = polygon;
        polygon.setOptions({ draggable: false, editable: false });
    }

    const onClickPolygon = (index) => {
        activePolygonIndex.current = index; 
    }

    const onLoadAutocomplete = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    }

    const onPlaceChanged = () => {
        const { geometry } = autocompleteRef.current.getPlace();
        const bounds = new window.google.maps.LatLngBounds();
        if (geometry.viewport) {
            bounds.union(geometry.viewport);
        } else {
            bounds.extend(geometry.location);
        }
        mapRef.current.fitBounds(bounds);
    }

    const onLoadDrawingManager = drawingManager => {
        drawingManagerRef.current = drawingManager;
    }

    //Cuando se finaliza el dibujado de un poligono (se vuelve a seleccionar el vertice de origen), se ingresa a la coleccion polygon como un nuevo documento
    const onOverlayComplete = async ($overlayEvent) => {
        drawingManagerRef.current.setDrawingMode(null);
        if ($overlayEvent.type === window.google.maps.drawing.OverlayType.POLYGON) {
            const newPolygon = $overlayEvent.overlay.getPath()
                .getArray()
                .map(latLng => ({ latitude: latLng.lat(), longitude: latLng.lng() }))

            
                    const timestamp = new Date().getTime()
            const firestore = getFirestore()
            const polygonCollectionRef = collection(firestore, 'polygon');
            try {
                await addDoc(polygonCollectionRef, { polygon: newPolygon, timestamp }) 
              } catch (error) {
                console.error('Error', error);
              }
            
        }
    }

    const onDeleteDrawing = () => {  
        const filtered = polygons.filter((polygon, index) => index !== activePolygonIndex.current) 
        setPolygons(filtered)
    }

    const onEditPolygon = (index) => {
        const polygonRef = polygonRefs.current[index];
        if (polygonRef) {
            const coordinates = polygonRef.getPath()
                .getArray()
                .map(latLng => ({ lat: latLng.lat(), lng: latLng.lng() }));

            const allPolygons = [...polygons];
            allPolygons[index] = coordinates;
            setPolygons(allPolygons)
        }
    }

    return (
        
        
        
        isLoaded
            ?
            <div className='map-container'id='map' style={{ position: 'absolute',display: 'flex', height:'100%',width:'70%' }}>
                    {/* mostrar fecha */}
                <div style={{ marginLeft: '20px',marginTop:'10px', marginRight:'2px', top: '20px', flex: 0.5 }}>
                <DateRangeSimple onInsideChange={InsideChange} />
                </div>
                
                <div style={{ flex: 1 }}>
                    {/* mostrar mapa */}
                    <GoogleMap
                    zoom={10}
                    center={center}
                    onLoad={onLoadMap}
                    mapContainerStyle={containerStyle}
                    onTilesLoaded={() => setCenter(null)}
                    
                >
                    <DrawingManager
                        onLoad={onLoadDrawingManager}
                        onOverlayComplete={onOverlayComplete}
                        options={drawingManagerOptions}
                    />
                    {
                        
                        polygons.map((iterator, index) => (
                        // mostrar poligonos
                            <Polygon
                           
                               key={index}
                            onLoad={(event) => onLoadPolygon(event, index)}
                              
                               onMouseDown={() => onClickPolygon(index)}
                               onMouseUp={() => onEditPolygon(index)}
                              onDragEnd={() => onEditPolygon(index)}
                              options={polygonOptions}
                               paths={iterator}
                               //draggable
                                //editable
                            />
                        ))
                          //  )
                    }
                    <Autocomplete
                        onLoad={onLoadAutocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type='text'
                            placeholder='Search Location'
                            style={autocompleteStyle}
                        />
                    </Autocomplete>
                    {documentPolylines.map((documentPoints, documentIndex) => (
                        //mostrar polylines
                        <Polyline
                           
                            key={documentIndex}
                            path={documentPoints}
                            options={{
                                strokeColor: '#0000ff',
                                strokeOpacity: 1.0,
                                strokeWeight: 2,
                            }}
                        />
                    ))}



                
                </GoogleMap>
                </div>
               
            </div>
            
            :
            null

            
    );
}

export default MapComponent; 