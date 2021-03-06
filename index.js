import React from 'react';
import PropTypes from 'prop-types';

/*
 * Use with smart autocomplete component. This component just show the list of search results
 * onChange: function to call when the user change the input value.
 * onSelect: function to be call when the user select a value from the list
 */
const DumbAutocomplete = ({onChange, placeholder, onSelect, value, data, name, label}) => {

  const onListItemClicked = (evt) => {
    onSelect(evt.currentTarget.rowIndex);
  };

  const testSearchMatch = () => {
    return data.length === 1  && value === data[0];
  };

  return <div
    className={'rc-autocomplete rc-form-group'}
  >
    <label htmlFor={name}>{label}</label>
    <input
      name={name}
      className={'rc-form-control rc-autocomplete__input'}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
    />
    <table
      className={'rc-autocomplete__list'}
      style={{
        visibility: testSearchMatch() || value.trim() === '' ? 'hidden' : 'visible'
      }}
    >
      {
        data.map((res, index) => {
          return <tr
            key={index}
            onClick={onListItemClicked}
          >
            <td>{res}</td>
          </tr>;
        })
      }
    </table>
  </div>;
};

DumbAutocomplete.propTypes = {
  search: PropTypes.func,
  onResponse: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  data: PropTypes.array,
  name: PropTypes.string,
  label: PropTypes.string
};

const TYPING_DELAY = 300;
let lastChange = Date.now();
let searchSchedule = null;

/*
 * Autocomplete receives a search function as argument. This function must receive a string as argument and
 * return a promise that resolves into an array. This array is then mapped using the toString function.
 * The suspended list is then populated with the returned value. When the list have just one element and its value
 * its equal to the value in the search field, the returnValue function its called with the object represented by the
 * string as an argument.
 */
class Autocomplete extends React.Component {

  constructor() {
    super();

    this.state = {
      searchedTerm: '',
      searchResults: [],
      readyToSend: null
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.scheduleSearch = this.scheduleSearch.bind(this);
    this.onItemSelect = this.onItemSelect.bind(this);
    this.callSearch = this.callSearch.bind(this);
    this.updateResults = this.updateResults.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
  }

  updateSearch(value) {
    this.setState({
      searchedTerm: value
    }, this.scheduleSearch);
  }

  onSearchChange(evt) {
    this.updateSearch(evt.target.value);
  }

  onItemSelect(index) {
    let newSearchedValue = this.state.searchResults[index];

    this.updateSearch(this.props.toString(newSearchedValue));
  }

  scheduleSearch() {
    if (this.state.searchedTerm.length === 1) {
      lastChange = Date.now();
      return;
    }

    if (lastChange - Date.now() < TYPING_DELAY) {
      clearTimeout(searchSchedule);
    }

    searchSchedule = setTimeout(this.callSearch);
    lastChange = Date.now();
  }

  callSearch() {
    this.props.search(this.state.searchedTerm)
      .then(this.updateResults)
      .catch(console.log);
  }

  updateResults(results) {
    if (this.state.searchedTerm.trim() === '') {
      results = [];
    }

    this.setState({
      searchResults: results
    }, () => {
      if (this.state.searchResults.length === 1 &&
        this.props.toString(this.state.searchResults[0]) === this.state.searchedTerm) {
        this.props.returnValue(this.state.searchResults[0]);
      } else {
        this.props.returnValue(null);
      }
    });
  }

  render() {
    const {
      name,
      label,
      placeholder,
      toString
    } = this.props;

    const {
      searchedTerm,
      searchResults
    } = this.state;

    return <DumbAutocomplete
      onChange={this.onSearchChange}
      placeholder={placeholder}
      onSelect={this.onItemSelect}
      value={searchedTerm}
      data={searchResults.map(toString)}
      name={name}
      label={label}
    />;
  }
}

Autocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  toString: PropTypes.func,
  returnValue: PropTypes.func,
  search: PropTypes.func
};

/*
 * Input number that receives a mask for formatted doc number of phone number
 * mask: string with a 'd' where it should be a number. Ex: (dd) ddddd dddd or ddd.ddd.ddd-dd
 */
const MaskedNumberInput = ({name, label, onChange, placeholder, value, mask, error}) => {
  let wrapperClass = 'rc-form-group';
  let formatted  = '';
  let lastReplaced = 0;
  let maxLength = mask.match(/d/g).length;

  if (error && error.length > 0) {
    wrapperClass += ' has-error';
  }

  for (let i = 0; i < mask.length; i++) {
    if (lastReplaced === value.length) {
      break;
    }

    if (mask.charAt(i) === 'd') {
      formatted += value.charAt(lastReplaced);
      lastReplaced++;
    } else {
      formatted += mask.charAt(i);
    }
  }

  const onKeyup = (evt) => {
    if (value.length >= maxLength) {
      evt.preventDefault();
    }

    if (evt.keyCode === 8) {
      evt.target.value = value.slice(0, -1);
      onChange(evt);
    }

    if (Number.isInteger(parseInt(evt.key)) && !(value.length >= maxLength)) {
      evt.target.value = value + evt.key;
      onChange(evt);
    }
  };

  return <div className={wrapperClass}>
    <label htmlFor={name}>{label}</label>
    <div className={'rc-form-field'}>
      <input
        type={'text'}
        name={name}
        className={'rc-form-control'}
        placeholder={placeholder}
        value={formatted}
        onKeyUp={onKeyup}
      />
      {error && <div className={'alert alert-danger'}>{error}</div>}
    </div>
  </div>;
};

MaskedNumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  mask: PropTypes.string,
  error: PropTypes.string
};

/*
 * Input for pure numbers
 */
const NumberInput = ({name, label, onChange, placeholder, value, error, min, max, step, disabled}) => {
  let wrapperClass='rc-form-group';
  if (error && error.length > 0) {
    wrapperClass += ' has-error';
  }

  return (
    <div className={wrapperClass}>
      <label htmlFor={name}>{label}</label>
      <div className={'rc-form-field'}>
        <input
          type={'number'}
          name={name}
          className={'rc-form-control'}
          placeholder={placeholder}
          value={value}
          min={min + ''}
          max={max + ''}
          step={step + ''}
          disabled={disabled}
          onChange={onChange} />
        { error && <div className={'alert alert-danger'}>{error}</div> }
      </div>
    </div>
  );
};

NumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  error: PropTypes.string
};

/*
 * The search field component call a function every time the input changes. If the delay between changes
 * are minor than 500ms, just the last change calls the function. It avoid call to many times the same function.
 * The component receives the search and onResponse functions. Search function must receive a string as argument
 * and its called every time the value changes. onResponse its called when search functions resolves. It is called
 * with the search function result as an argument.
 */
const SearchField = ({placeholder, label, name, search, onResponse}) => {
  const TYPING_DELAY = 500;
  let lastChange = Date.now();
  let searchSchedule;

  const onValueChange = (evt) => {
    let value = evt.target.value;

    if (Date.now() - lastChange < TYPING_DELAY) {
      clearTimeout(searchSchedule);
    }

    searchSchedule = setTimeout(() => {
      callSearch(value);
    }, TYPING_DELAY);
    lastChange = Date.now();
  };

  const callSearch = (value) => {
    search(value)
      .then(
        res => onResponse(res),
        err => console.log(err)
      );
  };

  return <div className={'rc-form-group'}>
    <label htmlFor={name}>{label}</label>
    <input
      placeholder={placeholder}
      className={'rc-form-control'}
      type={'text'}
      onChange={onValueChange}
    />
  </div>;
};

/*
 * Simple select input component
 */
const SelectInput = ({ name, label, onChange, options, value, defaultOption, error}) => {
  return (
    <div className={'rc-form-group'}>
      <label htmlFor={name}>{label}</label>
      <div className={'rc-form-field'}>
        <select
          className={'rc-form-control'}
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value={''}>{ defaultOption }</option>
          {
            options.map((option, index) => {
              return <option
                key={index}
                value={option.value}
              >
                {option.text}
              </option>;
            })
          }
        </select>
        { error && <div className={'alert alert-danger'}>{error}</div> }
      </div>
    </div>
  );
};

SelectInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultOption: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object)
};

/*
 * Table must receive three arrays. The data array must contain the data that will populate the table, the labels array
 * contains the labels of each column of the table and the attributesMap array contains the attribute names of the
 * object fields that should be displayed in the table. Note that the labels should appear in the same order of
 * attributesMap.
 */
const Table = ({data, labels, attributesMap, onRowClick, selectedRow}) => {
  if (labels.length !== attributesMap.length) {
    throw new Error('Invalid number of labels/attributes');
  }

  return <div className={'rc-table-wrapper'}>
    <table className={'rc-table'}>
      <thead className={'rc-table__header'}>
      <tr className={'rc-table__row'}>
        {
          labels.map((label, index) => {
            return <th key={index}>{label}</th>;
          })
        }
      </tr>
      </thead>
      <tbody className={'rc-table__body'}>
      {
        data.map((row, index) => {
          return <TableRow
            key={index}
            obj={row}
            onRowClick={onRowClick}
            attributes={attributesMap}
            selectedRow={selectedRow}
            index={index}
          />;
        })
      }
      </tbody>
    </table>
  </div>;
};

/*
 * Table row receives an object containing the data that should be displayed and an attributes array with the fields
 * that will fill the table row;
 */
const TableRow = ({obj, attributes, onRowClick, selectedRow, index}) => {
  return <tr
    onClick={onRowClick}
    className={'rc-table__row' + (selectedRow === index ? ' rc-table__row-selected' : '')}
  >
    {
      attributes.map((attr, index) => {
        return <td key={index}>{obj[attr]}</td>;
      })
    }
  </tr>;
};

/*
 * Simple text input
 */
const TextInput = ({name, label, onChange, placeholder, value, error}) => {
  let wrapperClass = 'rc-form-group';
  if (error && error.length > 0) {
    wrapperClass += ' has-error';
  }

  return (
    <div className={wrapperClass}>
      <label htmlFor={name}>{label}</label>
      <div className={'rc-form-field'}>
        <input
          type={'text'}
          name={name}
          className={'rc-form-control'}
          placeholder={placeholder}
          value={value}
          onChange={onChange} />
        {error && <div className={'alert alert-danger'}>{error}</div>}
      </div>
    </div>
  );
};

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string
};

/*
 * Simple date input
 */
const DateInput = ({name, label, onChange, placeholder, value, error}) => {
  let wrapperClass = 'rc-form-group';
  if (error && error.length > 0) {
    wrapperClass += ' has-error';
  }

  return (
    <div className={wrapperClass}>
      <label htmlFor={name}>{label}</label>
      <div className={'rc-form-field'}>
        <input
          type={'time'}
          name={name}
          className={'rc-form-control'}
          placeholder={placeholder}
          value={value}
          onChange={onChange} />
        {error && <div className={'alert alert-danger'}>{error}</div>}
      </div>
    </div>
  );
};

DateInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string
};

export {
  DumbAutocomplete,
  DateInput,
  MaskedNumberInput,
  NumberInput,
  SearchField,
  SelectInput,
  Autocomplete,
  Table,
  TableRow,
  TextInput
};

