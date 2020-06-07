import React, {useEffect, useState, ChangeEvent, FormEvent} from "react";
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker, Popup} from 'react-leaflet';
import api from "../../services/api";
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import './style.css';
import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEStateResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () =>{
    //Inicialização de Estados de componentes da pagina.

    const [items, setItems] = useState<Item[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [selectedState, setSelectedState] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

    const [formData, setFormData] = useState({
        name: '', email: '', whatsapp: ''
    });

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const history = useHistory();

    //useEffect -> Executa algo quando a página for carregada.
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
            setSelectedPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEStateResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const state = response.data.map(state => state.sigla);
            setStates(state);
        });
    }, []);

    useEffect(() => {
        if(selectedState === '0'){
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`).then(response => {
            const cities = response.data.map(city => city.nome);
            setCities(cities);
        });
    }, [selectedState]);

    /**
     * Handle Select State
     * @param event
     */
    function handleSelectState(event: ChangeEvent<HTMLSelectElement>) {
        const state = event.target.value;
        setSelectedState(state);
    }

    /**
     * Handle Select City
     * @param event
     */
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    /**
     * Handle Map Click
     * @param event
     */
    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng]);
    }

    /**
     * Handle Input Change
     * @param event
     */
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({...formData, [name]: value});
    }

    function handleSelectedItems(id: number) {
        const alreadySelectedItem = selectedItems.findIndex(item => item === id);
        if(alreadySelectedItem >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const state = selectedState;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name: name,
            email: email,
            whatsapp: whatsapp,
            state: state,
            city: city,
            latitude: latitude,
            longitude: longitude,
            items: items
        }

        await api.post('points', data);
        alert('Ponto de coleta criado com sucesso.');
        history.push('/');
    }
    
    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" title="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar Para Home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> Ponto de Coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={16} onClick={handleMapClick}>
                        <TileLayer attribution='&amp;copy <a href="https://osm.org/copyright">OpenStreetMap</a> contributoprs' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Marker position={selectedPosition}/>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="state">Estado (UF)</label>
                            <select name="state" id="state" onChange={handleSelectState} value={selectedState}>
                                <option value="0">Selecione uma UF</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}

                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens de coleta</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectedItems(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.title} title={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}


                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;