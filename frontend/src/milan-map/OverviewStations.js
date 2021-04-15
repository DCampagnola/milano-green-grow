import {Component} from "react";
import MilanMap from "./milan-map";
import '../services/main'

export default class OverviewStations extends Component {
    /**
     *
     * @type {{selected: ?TownHalLStats}}
     */
    state = {
        selected: null
    };

    onSelected(id) {
        if(id === this.state.selected?.cityHallID) {
            return this.setState({
                selected: null
            })
        }
        this.setState({selected: this.props.townHalls.find((townHall => townHall.cityHallID === id))})
    }

    render() {
        return (
            <div className="container body-1">
                <p>
                    A Milano ci sono {this.props.nStations} torrette di ricarica in totale, la massima distanza in cui
                    potresti vivere da
                    una torretta è di {this.props.maxDistanceFromStation} km. In media un abitante a Milano deve
                    percorrere {this.props.avgDistanceFromStation} km per raggiungere una
                    stazione di ricarica.
                </p>
                <p className="caption">Clicca su un municipio per sapere le statistiche per quel municipio</p>

                <div className="row">
                    <div className="col-12 col-md-6">

                        <MilanMap selected={this.state.selected?.cityHallID} onSelected={this.onSelected.bind(this)}/>
                    </div>
                    {   this.state.selected ?
                        (<div className="col-12 col-md-6">
                            <p className="headline-5">
                                Municipio {this.state.selected.cityHallID}
                            </p>
                            <p className="subtitle-2">Statistiche</p>
                            <p className="body-2">
                                Ci sono {this.state.selected?.nStations} stazioni di ricarica<br />
                                In media vivrai a {this.state.selected.avgDistanceFromStation} km di distanza dalla stazione di ricarica<br />
                                Al massimo potresti ritrovarti a {this.state.selected.maxDistanceFromStation} km di distanza dalla stazione di ricarica
                            </p>
                        </div>)
                        :
                        (
                            <p className="caption">Clicca su un municipio</p>
                        )
                    }
                </div>
            </div>
        )
    }
}
