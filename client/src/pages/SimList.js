import React, { useState, Fragment } from "react";
import { useEffect } from "react";

import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import DataTable from 'react-data-table-component';
import { Container, Row, Col, Table } from 'react-bootstrap'
import API from "./../components/API"
import '../css/Simlist.css';
import * as config from '../config.json'
export default function SimList() {
    const [createCount, setCreateCount] = useState(0);
    const [updateCount, setUpdateCount] = useState(0);
    const [deleteCount, setDeleteCount] = useState(0);
    const [success, setSuccsss] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Loading...")
    const [dataList, setDataList] = useState([]);
    const [showSaveBtn, setShowSaveBtn] = useState(false);

    // Modal show
    const [show, setShow] = useState(false);
    const columns = [
        {
            name: 'Simkartennummer',
            selector: 'Simkartennummer',
            sortable: true,
            style:{fontSize:"17px"},
        },
        {
            name: 'PUK',
            selector: 'PUK',
            sortable: true,
            sstyle:{fontSize:"17px"},
            
        },
        {
            name: 'Tarif',
            selector: 'Tarif',
            sortable: true,
            style:{fontSize:"17px"},
        },
        {
            name: 'Land VW Nummer',
            selector: 'Land_VW_Nummer',
            sortable: true,
            style:{fontSize:"17px"},
        },
        {
            name: 'Mark',
            selector: 'Mark',
            sortable: true,
            style:{fontSize:"17px"},
        },
        {
            name: 'External Link',
            selector: 'External_Link',
            style:{fontSize:"17px"},
            cell: (row, index, column, id)=> <a target={"_blank"} href={config.domain+'cis/'+row.id}>{row.Mark=="Create"?"":<>4me link</>}</a>
            
        }
    ];


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSave = () => {
        storeConfigurationItmes();
        setShow(false);
    }

    const storeConfigurationItmes = () => {
        setLoadingText("Saveing Changes...");
        setLoading(true);
        API.saveConfigurationItems()
            .then(res => res.json())
            .then((res) => {
                if (res.success) {
                    setSuccsss(true)
                } else {
                    alert(res.message)
                }
            })
    }
    
    

    useEffect(() => {
        setLoadingText("Loading...");
        setLoading(true);
        API.getConfigurationItems()
            .then(res => res.json())
            .then((res) => {
                setLoading(false);
                if (res.success) {
                    setCreateCount(res.createCount)
                    setUpdateCount(res.updateCount)
                    setDeleteCount(res.deleteCount)
                    let result = [];
                    res.data.forEach(function(item, index){
                        let id = item.id;
                        let systemId = item.systemID;
                        let puk = "";
                        let nummer = "";
                        let mark  = item.mark
                        let productName = item.product.name;
                        
                        item.customFields.forEach(element=>{
                            if(element.id == "PUK")
                            {
                                puk  = element.value
                            }
                        })

                        item.customFields.forEach(element=>{
                            if(element.id == "Nummer")
                            {
                                nummer  = element.value
                            }
                        })

                        result.push({
                            id:id,
                            Simkartennummer:systemId,
                            PUK:puk,
                            Tarif:productName,
                            Land_VW_Nummer:nummer,
                            Mark:mark,
                        })
                    })
                    setDataList([...result])
                    setShowSaveBtn(true)
                    console.log(res);
                } else {
                    alert(res.message)
                }
            })

    }, [])


    return (
        <div>
            <div className="Simlist" >
                {!success ?

                    (loading ?

                        (<div>
                            <div className="Simlist__content">
                                <h2>{loadingText}</h2>
                                <div className="Simlist__description">
                                    Please wait, this may take a few seconds.
                            </div>
                                <Spinner animation="border" />
                            </div>
                        </div>)
                        :
                        <div>

                            <div className="Simlist__content">
                                <h2>A1 Sim list</h2>
                                <div className="Simlist__description">
                                    In the list below you can see changes in phone numbers, which are new, obsolete or updated. <br />
                        In order to confirm the changes, please click the "submit" Button.
                    </div>

                                <h6 className="Simlist__change">Changes in the List</h6>
                                <div className="Simlist__changebox Simlist__changebox--new">
                                    <div className="Simlist__changenumber Simlist__changenumber--new">{createCount}</div>
                        new
                    </div>

                                <div className="Simlist__changebox Simlist__changebox--change">
                                    <div className="Simlist__changenumber Simlist__changenumber--change">{updateCount}</div>
                        updated
                    </div>

                                <div className="Simlist__changebox Simlist__changebox--remove">
                                    <div className="Simlist__changenumber Simlist__changenumber--remove">{deleteCount}</div>
                        removed
                    </div>
                            </div>
                            <div className="Simlist__content">
                                <Row>
                                    <Col>
                                    <DataTable
                                        data={dataList}
                                        columns={columns}
                                        // onRowClicked={(item)=>handleRowClick(item)}
                                        responsive={true}
                                        pointerOnHover={true}
                                        style={{fontSize:"20px"}}
                                    />
                                        
                                    </Col>
                                </Row>
                                <div className="Simlist__actionbuttons">
                                    <a className="btn btn-primary Simlist__buttoncancel" href={'/'} > Cancel</a>
                                    {showSaveBtn?
                                      <button className="btn btn-primary Simlist__buttonspace" onClick={handleShow}>Save</button>
                                    :""}
                                    
                                </div>
                            </div>
                        </div>) :
                    <div className="Simlist__content">
                        <h2>The A1 list has been updated successfully!</h2>
                    </div>
                }


            </div >
            <Modal show={show} onHide={handleClose} centered className="Simlist__modal">
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>You are about to save changes which are displayed in the table. Click "Save changes" if you want to save the changes. Otherwise cancel.
                </Modal.Body>
                <Modal.Footer>
                    <button className="Simlist__modalcancelbtn" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className={"Simlist__modalsubmitbtn"} onClick={handleSave}>
                        Save Changes
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}