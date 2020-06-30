
import React from 'react';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';
import 'moment/locale/es';

const server = "https://www.botemania.es"
const promoPageLink = "/api/config/promotions/v2/promotions-page.json";
moment().locale('es')


class PromoRow extends React.Component{
  constructor(props) { 
    super(props); 
    this.state = { config:{settings:{env:{}}}, jira:{fields:{}, key: null} }; 
    
  } 

  componentDidMount() {
    let url = server + this.props.promo.url.replace("index.html","");
    fetch(url+"config.json").then(response=>response.json()).then(json => {this.setState({config: json})});



  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.username != this.props.username || prevProps.password != this.props.password){
        let headers = new Headers();
        headers.set('Authorization', 'Basic ' + Buffer.from( this.props.username + ":" + this.props.password).toString('base64'));


        fetch("https://jira.gamesys.co.uk/rest/api/latest/search?jql=\"Path (URL) of the promotion\" ~ "+ this.props.promo.path, {method:'GET', headers: headers})
        .then(response=>response.json())
          .then(json => {
            if(json && json.issues && json.issues[0]){
              this.setState({jira: json.issues.find(j=>j.fields.customfield_12471 && j.fields.customfield_12471.trim()==this.props.promo.path.trim())})
              //this.setState({jira:  json.issues[0]});
            }
          });
      }
  }

  render(){
    return (
      <tbody>
        <tr>
          <td>
            <a href={'https://jira.gamesys.co.uk/browse/'+this.state.jira.key}>
              {this.state.jira.key}
            </a>
          </td>
          <td>
            {this.state.jira.fields && this.state.jira.key?
                moment(this.state.jira.fields.customfield_12274,"YYYY-MM-DD").isSame(moment(this.props.promo.startDate,"DD/MM/YYYY"))?'':'❌FI('+this.state.jira.fields.customfield_12274+')  '
              :''}
            {this.state.jira.fields && this.state.jira.key?
                moment(this.state.jira.fields.customfield_12470,"YYYY-MM-DD").isSame(moment(this.props.promo.expiryDate,"DD/MM/YYYY").subtract(1,"days"))?'':'❌FF ('+this.state.jira.fields.customfield_12470+')  '
              :''}

            {(this.state.jira.fields && this.state.jira.key && this.state.config.settings.env.prod)?
               this.state.config.settings.env.prod.promoID==this.state.jira.fields.customfield_12382?'':'❌ID('+this.state.jira.fields.customfield_12382+') '
              :''}
          </td>
          <td>
            {this.props.next?
              moment(this.props.next.startDate,"DD/MM/YYYY")< moment() && moment(this.props.next.expiryDate,"DD/MM/YYYY")> moment()?'🔥️':
                moment(this.props.next.startDate,"DD/MM/YYYY") < moment() && moment(this.props.next.expiryDate,"DD/MM/YYYY")< moment()?'🧟':
                  moment(this.props.next.startDate,"DD/MM/YYYY") > moment() && moment(this.props.next.expiryDate,"DD/MM/YYYY")> moment()?'🔮':
                  '🛑'
              :''
            }
            {this.props.next?
              moment(this.props.next.startDate,"DD/MM/YYYY").isSame(moment(this.props.promo.startDate,"DD/MM/YYYY").subtract(5,"days"),'date') && this.props.next.expiryDate==this.props.promo.startDate?'✔':
                '✖️'
              :''}

          </td>
          <td>
            <a target="_blank" href={server+'/promotion/'+this.props.promo.path+"?previewDate="+(moment(this.props.promo.startDate,"DD/MM/YYYY").format("DD-MM-YYYY"))}>
              {this.props.promo.title}
            </a>
          </td>
          <td>{this.state.config.settings.env.prod?this.state.config.settings.env.prod.promoID :""}</td>
          <td>
          {moment(this.props.promo.startDate,"DD/MM/YYYY")< moment() && moment(this.props.promo.expiryDate,"DD/MM/YYYY")> moment()?'🔥️':
              moment(this.props.promo.startDate,"DD/MM/YYYY") < moment() && moment(this.props.promo.expiryDate,"DD/MM/YYYY")< moment()?'🧟':
                moment(this.props.promo.startDate,"DD/MM/YYYY") > moment() && moment(this.props.promo.expiryDate,"DD/MM/YYYY")> moment()?'🔮':
                '🛑'
          }
          </td>
          <td style={{'color':this.props.promo.startDate==this.state.config.settings.startDate?"green":"red"}} >{moment(this.props.promo.startDate,"DD/MM/YYYY").format("DD MMM YY") }</td>
          <td style={{'color':this.props.promo.expiryDate==this.state.config.settings.expiryDate?"green":"red"}} >{moment(this.props.promo.expiryDate,"DD/MM/YYYY").format("DD MMM YY")}</td>
          <td>{this.props.promo.bucket}</td>
          <td>{this.props.promo.partners?this.props.promo.partners.join(','):''}</td>
          <td>{this.props.promo.devices}</td>
        </tr>
        <tr style={{'display':'none'}}>
          <td colSpan="10">
            hoola
          </td>
        </tr>
      </tbody>
    )
  }
}



class App extends React.Component { 
  
  constructor(props) { 
      super(props); 
      this.state = { promos:{} }; 
  } 

  componentDidMount() {
      fetch(server+promoPageLink).then(response=>response.json()).then(json => this.setState({promos: json}));
  }

  buscarJiras =()=>{

    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + Buffer.from(  document.getElementById('username').value + ":" + document.getElementById('password').value).toString('base64'));
    fetch("https://jira.gamesys.co.uk/rest/api/latest/mypermissions", {method:'GET', headers: headers}).then(
      response=>{
        if(response.ok)
          this.setState({username: document.getElementById('username').value , password:document.getElementById('password').value})
      }
    )
  }
  render() { 
        
    return (
      <div className="App">
        <div className="App-header">
          <h2>BTM Promotions</h2>
          <div>
            <input placeholder="Jira username" type="text" id="username"></input>
            <input placeholder="Jira password" type="password" id="password"></input>
            <button onClick={this.buscarJiras}>Buscar Jiras</button>
          </div>
          <br></br>
          <table>
            <thead>
              <tr>
                <th>Jira</th>
                <th>Jira Errors</th>
                <th>Próximamente</th>
                <th>Title</th>
                <th>ID</th>
                <th></th>
                <th>Start</th>
                <th>End</th>
                <th>Bucket</th>
                <th>Partner</th>
                <th>Devices</th>
              </tr>
            </thead>
            {
              (this.state.promos.categories)?
              this.state.promos.categories[0].promotions.map(
                (v, index)=>{
                  return <PromoRow key={index} username={this.state.username} password={this.state.password}  promo={v} next={this.state.promos.categories[1].promotions.find(f=> f.path == v.path)} ></PromoRow>
                } 
              ):null
              
            }
          </table>
        </div>
      </div>
    );
  } 
} 

export default App;

   