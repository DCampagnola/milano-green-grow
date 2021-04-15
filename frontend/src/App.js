import './App.css';
import Header from './layout/Header'
import {Component, useEffect, useState} from 'react';
import OverviewStations from "./milan-map/OverviewStations";
import {fetchStats, fetchTownHall} from "./services/main"

class App extends Component {
    componentDidMount() {
        fetchStats().then((info) => {
            this.setState({
                nStations: info.nStations,
                maxDistanceFromStation: info.maxDistanceFromStation,
                avgDistanceFromStation: info.avgDistanceFromStation,
                doneStats: true
            });
        });
        fetchTownHall().then((info) => {
            this.setState({
                townHalls: info,
                doneTownHall: true
            })
        })
    }
    state= {
        nStations: 0,
        maxDistanceFromStation: 20,
        avgDistanceFromStation: 40,
        townHalls: [],
        doneStats: false,
        doneTownHall: false
    }
    render() {
        return (
            <>
                <Header/>
                {
                    this.state.doneStats && this.state.doneTownHall ?
                        (
                            <OverviewStations nStations={this.state.nStations}
                                              maxDistanceFromStation={this.state.maxDistanceFromStation}
                                              avgDistanceFromStation={this.state.avgDistanceFromStation}
                                              townHalls={this.state.townHalls}/>
                        ) :
                        <p>Loading</p>
                }
            </>
        );
    }
}

export default App;
