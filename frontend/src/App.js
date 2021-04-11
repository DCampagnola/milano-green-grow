import logo from './logo.svg';
import './App.css';
import MilanMap from './milan-map/milan-map';
import { useState } from 'react';

function App() {
  const [state, setState] = useState()
  return (
    <>
    <p class="headline-1 text-center">Milano Green Growth</p>
    <p class="subtitle-1 text-center">Milan green situation</p>
    <hr />
    <div class="container body-1">
        <p>
        A Milano ci sono 45 torrette di ricarica in totale, la massima distanza in cui potresti vivere da una torretta è di 20 km. In media un abitante a Milano deve percorrere 1 km per raggiungere una stazione di ricarica.
        </p>
        <p class="caption">Clicca su un municipio per sapere le statistiche per quel municipio</p>

        <div class="row">
            <div class="col-12 col-md-6">

              <MilanMap onSelected={(a) => setState(a)}></MilanMap>
            </div>
            <div class="col-12 col-md-6">
                <p class="headline-5">
                    Municipio {state}
                </p>
                <p class="subtitle-2">Statistiche</p>
                <p class="body-2">
                    Ci sono 20 stazioni di ricarica
In media vivrai a 10 km di distanza dalla stazione di ricarica
Al massimo potresti ritrovarti a 2 km di distanza dalla stazione di ricarica
                </p>
            </div>
        </div>
    </div>
    </>
  );
}

export default App;
