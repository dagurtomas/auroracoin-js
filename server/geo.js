var geomodel = require('geomodel').create_geomodel()

var SEARCH_RADIUS = 1000
var records = {}

function all(){
  return Object.keys(records).map(function(key){
    return records[key]
  })
}

function reset(){
  records = {}
}

function save(lat, lon, userInfo, callback) {
  var user = cloneObject(userInfo)
  user.location = geomodel.create_point(lat, lon),
  user.geocells = geomodel.generate_geocells(user.location)

  records[user.id] = user

  search(user.location, user.id, callback)
}

function remove(id, callback) {
  delete records[id]
  callback()
}

function search(location, id, callback){
  var onGeocells = function(geocells, finderCallback) {
    var candidates = all().filter(function(record){
      return record.id !== id && haveIntersection(record.geocells, geocells)
    })
    finderCallback(null, candidates)
  }

  geomodel.proximity_fetch(location, 10, SEARCH_RADIUS, onGeocells, callback)
}


function haveIntersection(a1, a2){
  return a1.some(function(e){
    return a2.indexOf(e) > -1
  })
}

function cloneObject(obj){
  return JSON.parse(JSON.stringify(obj))
}

module.exports = {
  SEARCH_RADIUS: SEARCH_RADIUS,
  all: all,
  reset: reset,
  save: save,
  remove: remove
}