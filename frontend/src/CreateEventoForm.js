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
            clientes: [],
        };
        this.api = 'http://localhost:8000/'

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        axios.get(this.api + 'locais/?format=json')
            .then(res => {
                this.setState({localEventos: res.data});
            })

        axios.get(this.api + 'comidas/?format=json')
            .then(res => {
                this.setState({comidasDisponiveis: res.data});
            })

        axios.get(this.api + 'clientes/?format=json')
            .then(res => {
                this.setState({clientes: res.data});
            })
    }

    handleChange(event) {
        const target = event.target;
        const value =  target.value;
        const name = target.name;
        if( name === 'cliente'){
            const clienteId = parseInt(target.value);
            const cliente = this.state.clientes.find(c => c.id_cliente === clienteId);
            this.setState({ cliente })
        }
        if (name === 'comidas') {
            const comidaId = parseInt(target.value);
            const comida = this.state.comidasDisponiveis.find(c => c.comida_id === comidaId);
            let comidas = [...this.state.comidas];
            if (value) {
              comidas.push(comida);
            } else {
              comidas = comidas.filter(c => c.comida_id !== comidaId);
            }
            this.setState({ comidas });
          } else {
            this.setState({ [name]: value });
          }
        
          
    }

    handleSubmit(event) {
        event.preventDefault();
        const data = {
            nome: this.state.nome,
            descricao: this.state.descricao,
            observacao: this.state.observacao,
            cliente: this.state.cliente === '' ? this.state.clientes[0] : this.state.cliente,
            qtd_dias_evento: this.state.qtd_dias_evento,
            local: this.state.local === '' ? this.state.localEventos[0] : this.state.local,
            data_inicio: this.state.data_inicio,
            data_fim: this.state.data_fim,
            comidas: Array.isArray(this.state.comidas) ? this.state.comidas : []          };
        console.log("POST ")
        axios.post(this.api + 'eventos/', data)
            .then(response => {
                this.state.clear()
            })
            .catch(error => {
                console.log(error)
            });
        
    };


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
                    <select name="local" onChange={this.handleChange} defaultValue='------'  className="form-control" id="local">
                        {this.state.localEventos.map(local => <option key={local.id_local}
                                                                      value={local.id_local}>{local.nome}</option>)}
                    </select>
                </div>

                <label>Comidas</label>
                <div className="form-group" style={{
                    height: '30vh',
                    overflowY: 'scroll',
                    border: '1px solid #ced4da',
                    padding: '1vh'
                }}>
                    {this.state.comidasDisponiveis.map(comida => (
                        <div key={comida.id} className="form-check">
                            <input type="checkbox" name="comidas" value={comida.comida_id} onChange={this.handleChange}
                                   className="form-check-input" key={comida.comida_id} id={`comida-${comida.comida_id}`}/>
                            <label className="form-check-label" htmlFor={`comida-${comida.comida_id}`}>{comida.nome} -- R${comida.valor}</label>
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
                    <select name="cliente" defaultValue={'-------'} onChange={this.handleChange} className="form-control" id="cliente">
                        {this.state.clientes.map(cliente => <option key={cliente.id_cliente}
                                                                    value={cliente.id_cliente}>{cliente.nome}</option>)}
                    </select>

                </div>

                <input type="submit" value="Submit" className="btn btn-primary"/>
            </form>
        );
    }
}


export default CreateEventoForm;
