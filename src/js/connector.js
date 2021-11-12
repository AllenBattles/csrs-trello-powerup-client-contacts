import { defaultUnitForLocale, celsiusToFahrenheit, kphToMph } from './modules/util';
import fetchWeatherData from './modules/api';
import getConditionKey from './modules/conditions-map';
import localizationSettings from './modules/localizationSettings';

const { Promise } = window.TrelloPowerUp;
const REFRESH_INTERVAL = 1800; // 30 minutes in seconds
var GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

const showBadge = (command, type, prefs) => {
  if (command === 'card-badges') {
    return prefs[`${type}-front`] !== false;
  }
  if (command === 'card-detail-badges') {
    return prefs[`${type}-back`] !== false;
  }

  throw new Error('Unknown command', command);
};

const getWeatherBadges = (t, opts) =>
  Promise.all([
    t.card('coordinates'),
    t.get('member', 'private', 'units', defaultUnitForLocale(opts.locale)),
    t.get('board', 'shared'),
  ]).then(([card, units, prefs]) => {
    if (!card.coordinates) {
      // if the card doesn't have a location at all, we won't show any badges
      return [];
    }

    const tempBadge = {
      dynamic(trello) {
        return fetchWeatherData(trello).then(weatherData => {
          let { temp } = weatherData;
          if (units === 'metric') {
            temp = `${temp.toFixed()} °C`;
          } else {
            temp = `${celsiusToFahrenheit(temp).toFixed()} °F`;
          }
          return {
            title: trello.localizeKey('temperature'),
            text: temp,
            refresh: REFRESH_INTERVAL,
          };
        });
      },
    };

    const windBadge = {
      dynamic(trello) {
        return fetchWeatherData(trello).then(weatherData => {
          let windSpeed = weatherData.wind;
          if (units === 'metric') {
            windSpeed = `🌬️ ${windSpeed.toFixed()} kph`;
          } else {
            windSpeed = `🌬️ ${kphToMph(windSpeed).toFixed()} mph`;
          }
          return {
            title: trello.localizeKey('wind-speed'),
            text: windSpeed,
            refresh: REFRESH_INTERVAL,
          };
        });
      },
    };

    const conditionsBadge = {
      dynamic(trello) {
        return fetchWeatherData(trello).then(weatherData => {
          const conditionKey = getConditionKey(weatherData.conditions);
          return {
            title: trello.localizeKey('conditions'),
            icon: `https://openweathermap.org/img/w/${weatherData.icon}.png`,
            text: conditionKey ? trello.localizeKey(conditionKey) : '',
            refresh: REFRESH_INTERVAL,
          };
        });
      },
    };

    let badges = [];

    if (!prefs || typeof prefs !== 'object') {
      // default to all badges
      badges = [tempBadge, windBadge, conditionsBadge];
    } else {
      // there are some potential preferences
      [
        ['temp', tempBadge],
        ['wind', windBadge],
        ['conditions', conditionsBadge],
      ].forEach(([type, badge]) => {
        if (showBadge(t.getContext().command, type, prefs)) {
          badges.push(badge);
        }
      });
    }

    return badges;
  });



window.TrelloPowerUp.initialize({
  'board-buttons': function(t, options){
    return [{
      icon: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
      text: 'Client Contacts',
      callback: function(t){
  
          return t.popup({
            title: "Set Client Id Field",
            url: 'setfield.html'
          });
        
      }      
    }];
  },
  'card-back-section': function(t, options){
    return {
      title: 'Client Contacts',
      icon: GRAY_ICON, // Must be a gray icon, colored icons not allowed.
      content: {
        type: 'iframe',
        url: t.signUrl('./projectsummary.html'),
        height: 230 // Max height is 500
      }
    };	
}
});



