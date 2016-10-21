#!/usr/bin/env node
var generate = require('csv-generate');
var fastcsv = require('fast-csv');
var request = require('request');
var uu = require('underscore');
var repl = require('repl');
var csv = require('csv');
var fs = require('fs');

var orders = {};
var market = {rates: {}};
var rate;

console.log('Welcome to Bitcoin Trader \n === Main Menu ==== \n 1. Buy - Syntax: BUY <amount> <currency>\n 2. Sell - Syntax: Sell <amount> <currency>\n 3. Orders - Output your orders to a .CSV doc. \n 4. History - View current orders. \n 5. Exit - Quit the program. \n');

repl.start({
    prompt: 'coinbase: '
  , eval: function(cmd, context, filename, callback) {

      var input = cmd.toLowerCase().replace('(','').replace(')','').replace('\n', '').split(' '),
          amount = parseFloat(input[1]),
          orderID = new Date().toString();
          denomination = 'BTC';

        switch (input[0]) 
        {
          //Case to buy some USD, EUR, and BTC
          case 'buy':

          request('https://api.coinbase.com/v1/currencies/exchange_rates',function(error, response, body) {
            if (!error){market.rates = JSON.parse(body);}});

            if (typeof(input[2]) != 'undefined') {denomination = input[2].toUpperCase();}

            if (typeof(input[3]) != 'undefined') {priceCeiling = parseFloat(input[3]);}

            if (!amount) {callback('No amount specified.');
                break;} 

            if (denomination != 'BTC') {
              var originalCurrency = amount;

              var rate = market.rates[ 'btc_to_' + denomination.toLowerCase() ];

             if (typeof(rate) != 'undefined') {
                orders[ orderID ] = {
                    type: 'buy'
                  , amount: amount
                  , denomination: denomination
                };

                var btc_amount = (amount / rate);

                callback('ORDER TO BUY: ' + amount.toString() + ' ' + denomination + ' worth of BTC ' + rate + ' BTC/' + denomination + ' (' + amount + ' BTC/USD/EUR) Cost = ' + btc_amount);
              } 

              else {
               console.log('There was no known exchange rate for BTC/' + denomination + '. Sorry, order failed.');
              }

            } 

            else {
              orders[ orderID ] = {
                  type: 'buy'
                , amount: amount
                , denomination: denomination
              };

              callback('ORDER TO BUY ' + amount.toString() + ' BTC queued.');
            }

          break;

          //Case to sell some USD, EUR, and BTC
          case 'sell':

                    request('https://api.coinbase.com/v1/currencies/exchange_rates',function(error, response, body) {
            if (!error){market.rates = JSON.parse(body);}});

            if (typeof(input[2]) != 'undefined') {denomination = input[2].toUpperCase();}

            if (typeof(input[3]) != 'undefined') {priceCeiling = parseFloat(input[3]);}

            if (!amount) {callback('No amount specified.');
                break;} 

            if (denomination != 'BTC') {
              var originalCurrency = amount;

              var rate = market.rates[ 'btc_to_' + denomination.toLowerCase() ];

             if (typeof(rate) != 'undefined') {
                orders[ orderID ] = {
                    type: 'sell'
                  , amount: amount
                  , denomination: denomination
                };

                var btc_amount = (amount / rate);

                callback('ORDER TO SELL: ' + amount.toString() + ' ' + denomination + ' worth of BTC ' + rate + ' BTC/' + denomination + ' (' + amount + ' BTC/USD/EUR) Cost = ' + btc_amount);
              } 

              else {
               console.log('There was no known exchange rate for BTC/' + denomination + '. Sorry, order failed.');
              }

            } 

            else {
              orders[ orderID ] = {
                  type: 'sell'
                , amount: amount
                , denomination: denomination
              };

              callback('ORDER TO SELL ' + amount.toString() + ' BTC queued.');
            }

          break;

          //Case to output orders to a CSV file
          case 'order':

          var top = ["BUY/SELL", " Amount", " Denomination"];

          var string = csv.stringify({header: true, columns: top}); 

          Object.keys(orders).forEach(function(orderID) 
           {
              var order = orders[ orderID ];
              
              var result = (orderID + ' : ' + order.type.toUpperCase() + ' ' + order.amount + ' : UNFILLED');

          //Needed to install csv-generate to get working
          var generator = generate({columns: ['int', 'bool'], length: 2});

              generator.pipe(csv.transform(function(){

              return Object.keys(orders[orderID]).map(function(key, value){
                return orders[orderID][key]
              })

            })).pipe(string).pipe(fs.createWriteStream('data.csv', {flags: 'w'}));
          });

          callback('.CSV file created.');

          break;

          //Case to see current orders
          case 'history':

           console.log('=== YOUR ORDERS ===');

           Object.keys(orders).forEach(function(orderID) 
           {
              var order = orders[ orderID ];
              
              console.log(orderID + ' : ' + order.type.toUpperCase() + ' ' + order.amount + ' : UNFILLED');

           }); break;
   
            default:
            console.log('unknown command: "' + cmd + '"'); break;

          break;

          //Case to exit the program
          case 'exit':

          console.log('Good-bye');

          process.exit(1);

          break;
        }
      }
});









