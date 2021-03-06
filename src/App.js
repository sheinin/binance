import React, { Component } from 'react'
import TickerTable from './TickerTable.js'
import { w3cwebsocket as W3CWebSocket } from 'websocket'

const urlWS = 'wss://stream.binance.com/stream?streams=!miniTicker@arr'
const urlBin = 'https://api.jsonbin.io/b/5ecca6afe91d1e45d11196d7'
const secretKey = '$2b$10$Zt4hT13r8cfu/SVnwSZ/c./Ir.DeH9vspbCG9S8C1X2Qibf8lUfBS'


let client

export default class App extends Component {

  constructor(props) {

    super(props)

    this.state = {

      markets: {},
      tickers: [],
      mkt: '',
      sub: '',
      filter: '',
      connected: false

    }

    this.sortColumn = ''
    this.sortDirection = 'NONE'
    this.tickers = {}

    fetch(urlBin, {
      method: 'GET',
      crossDomain: true,
      headers: {
        'secret-key': secretKey
      }})
      .then(response => response.json())
      .then(data => {

        const tk = data.data

        let markets = {}

        for (let i = 0, ix = tk.length; i < ix; i += 1) {

          const pm = tk[i].pm,
                q = tk[i].q,
                s = tk[i].s,
                c = Number(tk[i].c),
                o = Number(tk[i].o),
                b = tk[i].b,
                v = Number(tk[i].v)

          markets[pm] = markets[pm] || []

          !~markets[pm].indexOf(q) && markets[pm].push(q)

          this.tickers[s] = {

            mkt: pm,
            sub: q,
            latest: c,
            open: o,
            stock: s,
            ticker: b,
            volume: v

          }

        }

        this.setState({ markets: markets })

      })

  }

  changeMarket = mkt => this.setState({sub: '', mkt: mkt}, this.getTickers)

  changeSubMarket = sub => this.setState({sub: sub}, this.getTickers)

  changeFilter = filter => this.setState({filter: filter}, this.getTickers)

  changeSort = (sortColumn, sortDirection) => {

    this.sortColumn = sortColumn ? sortColumn : this.sortColumn
    this.sortDirection = sortDirection ? sortDirection : this.sortDirection

    this.getTickers()

  }

  connectWS = () => {

    this.setState({connected: !this.state.connected},

      () => {

        if (this.state.connected) {

          client = new W3CWebSocket(urlWS)

          client.onopen = () => console.log('WebSocket Client Connected')

          client.onerror = () => {

            console.log('WebSocket error')
            this.setState({connected:false})

          }

          client.onmessage = message => {

            const data = JSON.parse(message.data).data

            data.forEach(data => {

              if (data.s in this.tickers)

                this.tickers[data.s] = {

                  ...this.tickers[data.s],
                  latest: Number(data.c),
                  open: this.tickers[data.s].open,
                  volume: this.tickers[data.s].volume + Number(data.v)

                }

            })

            this.getTickers()

          }

        } else

          client.close()

      })

  }
  

  getTickers = () => {

    const tk = this.tickers,
          sd = this.sortDirection,
          sc = this.sortColumn

    let tickers = []

    for (let i in tk)

      if (this.state.mkt === tk[i].mkt &&
          (!this.state.sub || this.state.sub === tk[i].sub) &&
          (!this.state.filter || ~tk[i].ticker.toUpperCase().indexOf(this.state.filter)))

        tickers.push({

          pair: tk[i].ticker + '/' + tk[i].mkt + (tk[i].sub && tk[i].sub !== tk[i].mkt ? '/' + tk[i].sub : ''),
          last_price: Number(tk[i].latest),
          change: ((tk[i].latest - tk[i].open) / (tk[i].open * 100)),
          volume: tk[i].volume

        })

    this.setState({ tickers: sd !== "NONE" ? [...tickers].sort((a, b) => sd === "ASC" ? a[sc] > b[sc] ? 1 : -1 : a[sc] < b[sc] ? 1 : -1) : tickers })

  }

  
  render = () => (

      <TickerTable
        connected={this.state.connected}
        markets={this.state.markets}
        tickers={this.state.tickers}
        changeFilter={this.changeFilter}
        changeMarket={this.changeMarket}
        changeSort={this.changeSort}
        changeSubMarket={this.changeSubMarket}
        connectWS={this.connectWS}
        getTickers={this.getTickers}
      />

    )

}
