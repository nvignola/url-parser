import iconsRender from './iconsRender';

/* eslint-disable implicit-arrow-linebreak */
// eslint-disable-next-line no-undef

export default (document) => {
  const injectContent = (content) => {
    document.querySelector('#container').innerHTML = content;
  };

  const getSplitElement = (url) => {
    const SPLIT_IDENTIFIERS = ['?', '#'];

    // TODO
    // - Implement custom identifier
    return SPLIT_IDENTIFIERS.find(identifier => url.includes(identifier));
  };

  const parseURL = (urlObj = {}) => {
    const QS_DIVIDER = '&';
    const TUPLE_DIVIDER = '=';
    const {
      info: { queryString },
    } = urlObj;
    const arrKeyValue = queryString
      ? decodeURI(queryString)
        .split(QS_DIVIDER)
        .map((tuple) => {
          const [key, value] = tuple.split(TUPLE_DIVIDER);

          return {
            key,
            value,
          };
        })
      : [];

    return arrKeyValue;
  };

  const printTable = (arr) => {
    const tableContent = arr.reduce(
      (acc, value, index) =>
        acc.concat(`
      <tr data-index="${index}">
        <td>
        <input ref="js-${value.key}" style="width: 100%" value="${value.key}" type="text">
        </td>
        <td>
        <input refs="params" style="width: 100%" data-key="${value.key}" value="${
  value.value
}" type="text">
          </td>
        <td class="actions-container">
          <button title="Copy [parameter]=[value] tuple" class="pure-button copy btn-success btn-action" data-copy=${`${
    value.key
  }=${value.value}`}">${iconsRender.renderCopyIcon()}</button>
          <button title="Remove parameter" class="pure-button remove btn-error btn-action" data-index="${index}">${iconsRender.renderDeleteIcon()}</button>
        </td>
      </tr>
  `),
      '',
    );

    const TABLE = `
    <table id="url-parsed-table" class="pure-table pure-table-striped">
      <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
      </thead>
      <tbody>
        ${tableContent}
      </tbody>
    </table>
  `;

    return TABLE;
  };

  const printEmptyMsg = () => '<strong>Url without query string.</strong>';

  const urlInfo = (plainUrl) => {
    const SPLIT_IDENTIFIERS = ['?', '#'];

    // TODO
    // - Implement custom identifier
    const qs = SPLIT_IDENTIFIERS.find(identifier => plainUrl.includes(identifier));
    const [pathname, queryString] = plainUrl.split(qs);

    const info = {
      url: plainUrl,
      pathname,
      queryString,
      urlDivider: qs,
    };

    return () => ({
      info,
    });
  };

  const copy = (text) => {
    // Create a textbox field where we can insert text to.
    const copyFrom = document.createElement('textarea');

    // Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    // Append the textbox field into the body as a child.
    // "execCommand()" only works when there exists selected text, and the text is inside
    // document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);

    // Select all the text!
    copyFrom.select();

    // Execute command
    document.execCommand('copy');

    // (Optional) De-select the text using blur().
    copyFrom.blur();

    // Remove the textbox field from the document.body, so no other JavaScript nor
    // other elements can get access to this.
    document.body.removeChild(copyFrom);
  };

  const getNewRoute = (urlObj, newTuples) =>
    `${urlObj.info.pathname}${urlObj.info.urlDivider}${newTuples.join('&')}`;

  return {
    copy,
    injectContent,
    getSplitElement,
    parseURL,
    printEmptyMsg,
    printTable,
    getNewRoute,
    urlInfo,
  };
};
