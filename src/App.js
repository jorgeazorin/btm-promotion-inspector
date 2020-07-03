
import React from 'react';
import logo from './logo.svg';
import './App.css';
import moment from 'moment';
import 'moment/locale/es';
import ReactTooltip from "react-tooltip";


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
              let Fjira = json.issues.find(j=>j.fields.customfield_12471 && j.fields.customfield_12471.trim().includes(this.props.promo.path.trim()));
              if(Fjira)
                this.setState({jira: Fjira});
              //this.setState({jira:  json.issues[0]});
            }
          });
      }
  }

  render(){
    return (
        <tr className={this.props.index==0 && this.props.index2!=0?'primeraMes':''}>
          {this.props.index==0?
            <td className="tdMonthName" style={{"vertical-align":"middle"}} rowSpan={this.props.mes.promos.length}> <span >{moment(this.state.config.settings.startDate,"DD/MM/YYYY").format("MMM YY")}</span> </td>
          :null}
          <td>
            <ReactTooltip></ReactTooltip>
            <a target="_blank" href={'https://jira.gamesys.co.uk/browse/'+this.state.jira.key}>
              {this.state.jira.key}
            </a>
          </td>
          <td>
            {this.state.jira.fields && this.state.jira.key?
                moment(this.state.jira.fields.customfield_12274,"YYYY-MM-DD").isSame(moment(this.props.promo.startDate,"DD/MM/YYYY"))?
                <span data-tip={"Fecha Inicio Jira correcta: "+this.state.jira.fields.customfield_12274}>✅</span>:
                <span data-tip={'❌ Fecha inicio en jira: '+this.state.jira.fields.customfield_12274+''}>❌</span>
              :<span data-tip="Fecha Inicio">❓</span>}

            {this.state.jira.fields && this.state.jira.key?
                moment(this.state.jira.fields.customfield_12470,"YYYY-MM-DD").isSame(moment(this.props.promo.expiryDate,"DD/MM/YYYY").subtract(1, 'days'))?
                <span data-tip={"Fecha Fin Jira correcta: "+this.state.jira.fields.customfield_12470}>✅</span>:
                <span data-tip={'❌ Fecha fin en jira: '+this.state.jira.fields.customfield_12470+''}>❌</span>
              :<span data-tip="Fecha fin">❓</span>}

            {(this.state.jira.fields && this.state.jira.key && this.state.config.settings.env.prod)?
                this.state.config.settings.env.prod.promoID==this.state.jira.fields.customfield_12382?
                <span data-tip={"Promo ID Jira correcta: "+this.state.jira.fields.customfield_12382}>✅</span>:
                <span data-tip={'❌ Promo ID Jira: '+this.state.jira.fields.customfield_12382+''}>❌</span>
              :<span data-tip="Promo Id">❓</span>}

            {(this.state.jira.fields && this.state.jira.key)?
                 this.props.promo.bucket==this.state.jira.fields.customfield_12472||(this.state.jira.fields.customfield_12472=="N/A" && !this.props.promo.bucket )?
                <span data-tip={"Bucket Jira correcto: "+this.state.jira.fields.customfield_12472}>✅</span>:
                <span data-tip={'❌ Bucket Jira: '+this.state.jira.fields.customfield_12472+''}>❌</span>
              :<span data-tip="Bucket">❓</span>}


  
          </td>
          <td>
          {moment(this.props.promo.startDate,"DD/MM/YYYY")< moment() && moment(this.props.promo.expiryDate,"DD/MM/YYYY")> moment()?<span data-tip="Promo live">🔥</span>:
              moment(this.props.promo.startDate,"DD/MM/YYYY") < moment() && moment(this.props.promo.expiryDate,"DD/MM/YYYY")< moment()?<span data-tip="Promo acabada">💀</span>:
                moment(this.props.promo.startDate,"DD/MM/YYYY") > moment() && moment(this.props.promo.expiryDate,"DD/MM/YYYY")> moment()?<span data-tip="Promo futura">🔮</span>:
                <span data-tip="Algo pasa">❌</span>
          }
          </td>
          <td>
            <a target="_blank" href={server+'/promotion/'+this.props.promo.path+"?previewDate="+(moment(this.props.promo.startDate,"DD/MM/YYYY").format("DD-MM-YYYY"))}>
              {this.props.promo.title}
            </a>
          </td>
          <td>{this.state.config.settings.env.prod?this.state.config.settings.env.prod.promoID :""}</td>
          <td className={this.props.promo.startDate==this.state.config.settings.startDate?"green":"red"}  data-tip={this.props.promo.startDate==this.state.config.settings.startDate?"Fechas promo y schedule coinciden":("Fecha promo: "+moment(this.state.config.settings.startDate,"DD/MM/YYYY").format("DD MMM YY"))}>
            {moment(this.props.promo.startDate,"DD/MM/YYYY").format("DD MMM YY") }
          </td>
          <td className={this.props.promo.expiryDate==this.state.config.settings.expiryDate?"green":"red"}  data-tip={this.props.promo.expiryDate==this.state.config.settings.expiryDate?"Fechas promo y schedule coinciden":("Fecha promo: "+moment(this.state.config.settings.expiryDate,"DD/MM/YYYY").subtract(1,'days').format("DD MMM YY"))} >
            {moment(this.props.promo.expiryDate,"DD/MM/YYYY").subtract(1,'days').format("DD MMM YY")}
          </td>
          <td>
            {this.props.next?
              moment(this.props.next.startDate,"DD/MM/YYYY")< moment() && moment(this.props.next.expiryDate,"DD/MM/YYYY")> moment()?<span data-tip="La promo está apareciendo en la sección próximamente">🔥</span>:
                moment(this.props.next.startDate,"DD/MM/YYYY") < moment() && moment(this.props.next.expiryDate,"DD/MM/YYYY")< moment()?<span data-tip="La promo apareció en su momento en la sección próximamente">💀</span>:
                  moment(this.props.next.startDate,"DD/MM/YYYY") > moment() && moment(this.props.next.expiryDate,"DD/MM/YYYY")> moment()?<span data-tip="La promo aparecerá en la sección próximamente">🔮</span>:
                  <span data-tip="Algo pasa">❌</span>
              :''
            }
            {this.props.next?
              moment(this.props.next.startDate,"DD/MM/YYYY").isSame(moment(this.props.promo.startDate,"DD/MM/YYYY").subtract(5,"days"),'date') && this.props.next.expiryDate==this.props.promo.startDate?<span data-tip={"Próximamente 5 días antes: "+this.props.next.startDate + " - " + moment(this.props.next.expiryDate,"DD/MM/YYYY").subtract(1,'days').format("DD MMM YY")}>✅</span>:
                <span data-tip="Próximamente no es 5 días antes o no desaparece con el inicio de la promo">❌</span>
              :''}

          </td>
          <td>{this.props.promo.bucket}</td>
          <td>{this.props.promo.partners?this.props.promo.partners.join(','):''}</td>
          <td>{this.props.promo.devices}</td>
        </tr>
    )
  }
}



class App extends React.Component { 
  
  constructor(props) { 
      super(props); 
      this.state = { promos:{}, meses:[] }; 
  } 

  componentDidMount() {
      fetch(server+promoPageLink).then(response=>response.json()).then(json => {
        var meses = [];
        json.categories[0].promotions.map(promo=>{
          var promoDate = moment(promo.startDate,"DD/MM/YYYY");
          var mes = meses.find(m=>m.mes == promoDate.format("YYYYMM"));
          if(mes){
            mes.promos.push(promo);
          }else{
            meses.push({mes: promoDate.format("YYYYMM"), promos:[promo]})
          }
        });
        this.setState({promos: json, meses: meses});
      });
  }

  buscarJiras =()=>{

    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + Buffer.from(  document.getElementById('username').value + ":" + document.getElementById('password').value).toString('base64'));
    fetch("https://jira.gamesys.co.uk/rest/api/latest/mypermissions", {method:'GET', headers: headers}).then(
      response=>{
        if(response.ok)
          this.setState({username: document.getElementById('username').value , password:document.getElementById('password').value})
        else
          alert("Error iniciando sesión en Jira")
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
                <th>Mes</th>
                <th>Jira</th>
                <th>Jira Errors</th>
                <th></th>
                <th>Title</th>
                <th>ID</th>
                <th>Schedule Start</th>
                <th>Schedule End</th>
                <th>Próximamente</th>
                <th>Bucket</th>
                <th>Partner</th>
                <th>Devices</th>
              </tr>
            </thead>
            <tbody>
            {
              /*(this.state.promos.categories)?
              this.state.promos.categories[0].promotions.map(
                (v, index)=>{
                  return <PromoRow key={index} username={this.state.username} password={this.state.password}  promo={v} next={this.state.promos.categories[1].promotions.find(f=> f.path == v.path)} ></PromoRow>
                } 
              ):null*/
              this.state.meses.map(
                (m, index2)=>{
                  return m.promos.map((v, index)=>{
                    return <PromoRow mes={m} index2={index2} index={index} key={index} username={this.state.username} password={this.state.password}  promo={v} next={this.state.promos.categories[1].promotions.find(f=> f.path == v.path)} ></PromoRow>

                  });
                }
              )
            }
            </tbody>
          </table>
        </div>
      </div>
    );
  } 
} 

export default App;

   