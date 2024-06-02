import './App.css';
import React, {Component} from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

class CreateEventoForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nome: '',
            descricao: '',
            observacao: '',
            qtd_dias_evento: '',
            comidas: [],
            data_inicio: '',
            data_fim: '',
            local: '',
            cliente: '',
            localEventos: [],
            comidasDisponiveis: [],
            clientes: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

     componentDidMount() {
       axios.get('http://localhost:8000/locaislocais/')
         .then(res => {
           this.setState({ localEventos: res.data });
         })

       axios.get('http://localhost:8000/comidascomidas/?format=json')
         .then(res => {
           this.setState({ comidasDisponiveis: res.data });
         })

       axios.get('http://localhost:8000/clientesclientes/')
         .then(res => {
           this.setState({ clientes: res.data });
         })
     }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        // Perform the necessary action with the form data
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="container mt-5">
                <div className="form-group">
                    <label htmlFor="nome">Nome</label>
                    <input type="text" name="nome" onChange={this.handleChange} className="form-control" id="nome"/>
                </div>

                <div className="form-group">
                    <label htmlFor="descricao">Descrição</label>
                    <textarea name="descricao" onChange={this.handleChange} className="form-control" id="descricao"
                              style={{height: '200px'}}/>
                </div>

                <div className="form-group">
                    <label htmlFor="observacao">Observação</label>
                    <textarea name="observacao" onChange={this.handleChange} className="form-control" id="observacao"
                              style={{height: '200px'}}/>
                </div>

                <div className="form-group">
                    <label htmlFor="qtd_dias_evento">Quantidade de dias do evento</label>
                    <input type="number" name="qtd_dias_evento" onChange={this.handleChange} className="form-control"
                           id="qtd_dias_evento"/>
                </div>

                <div className="form-group">
                    <label htmlFor="local">Local</label>
                    <select name="local" onChange={this.handleChange} className="form-control" id="local">
                        {this.state.localEventos.map(local => <option key={local.id}
                                                                      value={local.id}>{local.nome}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Comidas</label>
                    {this.state.comidasDisponiveis.map(comida => (
                        <div key={comida.id} className="form-check" style={{
                            height: '30vh',
                            overflowY: 'scroll',
                            border: '1px solid #ced4da'}}>
                            <input type="checkbox" name="comidas" value={comida.id} onChange={this.handleChange}
                                   className="form-check-input" id={`comida-${comida.id}`}/>
                            <label className="form-check-label" htmlFor={`comida-${comida.id}`}>{comida.nome}</label>
                        </div>
                    ))}
                </div>

                <div className="form-group">
                    <label htmlFor="data_inicio">Data de início</label>
                    <input type="date" name="data_inicio" onChange={this.handleChange} className="form-control"
                           id="data_inicio"/>
                </div>

                <div className="form-group">
                    <label htmlFor="data_fim">Data de fim</label>
                    <input type="date" name="data_fim" onChange={this.handleChange} className="form-control"
                           id="data_fim"/>
                </div>

                <div className="form-group">
                    <label htmlFor="cliente">Cliente</label>
                    <select name="cliente" onChange={this.handleChange} className="form-control" id="cliente">
                        {this.state.clientes.map(cliente => <option key={cliente.id}
                                                                    value={cliente.id}>{cliente.nome}</option>)}
                    </select>
                </div>

                <input type="submit" value="Submit" className="btn btn-primary"/>
            </form>
        );
    }
}


export default CreateEventoForm;
