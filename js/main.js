// -------------------------------------------------------------
// -- Global Variables (I know, I'm going to hell)
// -------------------------------------------------------------

var userID;

// -------------------------------------------------------------
// -- API URL generators
// -------------------------------------------------------------

var TOKEN = '11c9b3e24cd711e6beb89e71128cae77'
var DOMAIN = 'dot.tecnico.ulisboa.pt'
var API_PREFIX = 'https://' + DOMAIN + '/api/internalBilling/v1/print/user/'
var TOKEN_FIELD = '?token=' + TOKEN

function url_api_list(user) {
    return API_PREFIX + user + '/listUnits' + TOKEN_FIELD
}

function url_api_current(user) {
    return API_PREFIX + user + '/currentBillingInformation' + TOKEN_FIELD
}

function url_api_set_unit(user, unitID) {
    return API_PREFIX + user + '/setUnit/' + unitID + TOKEN_FIELD
}

// -------------------------------------------------------------
// -- DOM Objects Functions
// -------------------------------------------------------------

function create_glyphicon_button_label(glyph) {
    if (glyph == undefined) glyph = 'ok'
    return $(' \
        <span class="btn-label" data-type="'+glyph+'"> \
                <i class="glyphicon glyphicon-'+glyph+'"></i> \
        </span> \
    ');
}

function create_unit_button_dom(id, name) {
    var balance = Math.random() * (10 - -10) + -10
    var btn_class = (balance > 0) ? "default" : "danger"
    var btn_disabled = (balance > 0) ? "" : "disabled"
    var exclamation_glyph = (balance > 0) ? "" : create_glyphicon_button_label("exclamation-sign").wrap('<p/>').parent().html()

    return $('\
        <button data-unit-id="'+id+'" data-balance="'+balance+'" '+btn_disabled+' type="button" class="btn btn-labeled btn-'+btn_class+'"> \
            <span class="btn-text">'+name+'</span> \
            <hr> \
            <span class="btn-text">Saldo: '+balance.toFixed(2)+' €</span> \
        </button> \
    ');
}

function get_button_of_unit(id) {
    return $('button[data-unit-id='+id+']');
}

// -------------------------------------------------------------
// -- API Functions
// -------------------------------------------------------------

function UI_set_unit(id) {
    var btn = get_button_of_unit(id)
    $('button').removeClass('btn-success');
    $('.btn-label[type=ok]').remove()
    btn.addClass('btn-success');
    btn.prepend(create_glyphicon_button_label())
}

// -------------------------------------------------------------
// -- API Functions
// -------------------------------------------------------------

function api_set_unit(id) {
    $.post(url_api_set_unit(userID, id))
        .done(set_unit_success_callback)
        .fail(set_unit_fail_callback)
}

// -------------------------------------------------------------
// -- API Callbacks
// -------------------------------------------------------------

function get_current_unit_success(data) {
    UI_set_unit(data.id)
}

function get_current_unit_failed() {
    alert('failed to get current unit')
}

function get_units_success_callback(units) {
    for (var i = 0; i < units.length; i++) {
        units_dom.append(create_unit_button_dom(units[i].id, units[i].presentationName));
    }

    $("button").each(function() {
        if ($(this).data('balance') <= 0) {
            console.log(this)
            $(this).prepend(create_glyphicon_button_label("exclamation-sign"))
        }
    })

    add_button_event_handler()

    $.get(url_api_current(userID))
        .done(get_current_unit_success)
        .fail(get_current_unit_failed)
}

function get_units_failed_callback() {
    alert("failed to get units from dot")
}

function set_unit_success_callback(unit) {
    UI_set_unit(unit.id)
}

function set_unit_fail_callback() {
    alert('Failed posting to dot')
}

// -------------------------------------------------------------
// -- Event Handlers
// -------------------------------------------------------------

function handle_button_click(e) {
    var disabled_state = $('button').prop('disabled')
    $('button').prop('disabled', true);
    $(this).blur();
    api_set_unit($(this).data('unit-id'))
    $('button').each(function() {
        $(this).prop('disabled', $(this).data('balance') <= 0)
    })
    return false;
}


function add_button_event_handler() {
    $("button[data-unit-id]").click(handle_button_click)
}

// -------------------------------------------------------------
// -- Session Callbacks
// -------------------------------------------------------------

function session_success_callback (sessRequest, sessResponse) {
    /*var sessInfoObj = xrxSessionParseGetSessionInfo(sessResponse);

    if (!sessInfoObj)
    {
        alert("Failed to get session info");
    }

    userID = xrxGetElementValue(sessInfoObj, 'userID')
    */
    userID = 'ist175714'
    $.get(url_api_list(userID))
        .done(get_units_success_callback)
        .fail(get_units_failed_callback)
}

function session_failed_callback() {
    alert("The SessionGetInfo failed =(");
}

// -------------------------------------------------------------
// -- Start the app
// -------------------------------------------------------------

var units_dom = $("#units");

//xrxSessionGetSessionInfo("https://localhost", session_success_callback, session_failed_callback);
session_success_callback(1,2)