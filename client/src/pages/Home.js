
import React from "react";
import { Container } from 'react-bootstrap';
import '../css/Home.css';

export default function Home() {

    return (
        <div className="Home">
            <div className="Home__content">
                <div className="text-left">
                    <h2 className="Home__headline">A1 - SIM Checker</h2>
                    <p>Welcome! This tool has been build, for updating the list of SIM Cards into the 4em.com platform.</p>
                    <p>Click the button to start.</p>
                    <div className="Home__button--align">
                        <a className="btn btn-primary Home__button" href={'/simlist'} > Check SIM  cards</a>
                    </div>
                </div>
            </div>
        </div>
    )
}