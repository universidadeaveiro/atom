(($) => {
  "use strict";
  
  console.log("SB LOADING 1...");

  $(function () {
    var $node = $(".index #fullwidth-treeview-displayable");
    console.log("SB LOADING 2...");
    if ($node.length) {
      loadTreeView();
    }
  });

  function makeFullTreeviewCollapsible(
    $treeViewConfig,
    $mainHeader,
    $fwTreeViewRow
  ) {
    var $wrapper = $('<section class="full-treeview-section"></section>');
    var $toggleButton = $('<a href="#" class="fullview-treeview-toggle"></a>');

    // Adjust bottom margins
    var bottomMargin = $fwTreeViewRow.css("margin-bottom");
    $fwTreeViewRow.css("margin-bottom", "0px");
    $wrapper.css("margin-bottom", bottomMargin);

    // Set toggle button text and add to wrapper
    $toggleButton.text($treeViewConfig.data("closed-text"));
    $toggleButton.appendTo($wrapper);

    // Add wrapper to the DOM then hide the treeview and add it to the wrapper
    $mainHeader.after($wrapper);
    $fwTreeViewRow.hide();
    $fwTreeViewRow.appendTo($wrapper);

    // Activate toggle button
    $toggleButton.on("click", function () {
      // Determine appropriate toggle button text
      var toggleText = $treeViewConfig.data("opened-text");

      if ($fwTreeViewRow.css("display") != "none") {
        toggleText = $treeViewConfig.data("closed-text");
      }

      // Toggle treeview and set toggle button text
      $fwTreeViewRow.toggle(400);
      $toggleButton.text(toggleText);
    });
  }

  

  function loadTreeView() {
    var $treeViewConfig = $("#fullwidth-treeview-configuration");
    var treeViewCollapseEnabled =
      $treeViewConfig.data("collapse-enabled") == "yes";
    var collectionUrl = $treeViewConfig.data("collection-url");
    var itemsPerPage = $treeViewConfig.data("items-per-page");
    var pathToApi = "/informationobject/fullWidthTreeView";
    var $fwTreeView = $('<div id="fullwidth-treeview"></div>');
    var $fwTreeViewRow = $('<div id="fullwidth-treeview-row"></div>');
    var $mainHeader = $("#main-column h1").first();
    var $moreButton = $("#fullwidth-treeview-more-button");
    var $resetButton = $("#fullwidth-treeview-reset-button");
    var pager = new Qubit.TreeviewPager(
      itemsPerPage,
      $fwTreeView,
      collectionUrl + pathToApi
    );

    // Add tree-view divs after main header, animate and allow resize
    $mainHeader.after(
      $fwTreeViewRow
        .append($fwTreeView)
        .animate({ height: "200px" }, 500)
        .resizable({ handles: "s" })
    );

    $mainHeader.before($resetButton);
    $mainHeader.before($moreButton);

    // Optionally wrap treeview in a collapsible container
    if (treeViewCollapseEnabled) {
      makeFullTreeviewCollapsible($treeViewConfig, $mainHeader, $fwTreeViewRow);
    }

    // Declare jsTree options
    var options = {
      plugins: ["types", "dnd"],
      types: treeviewTypes,
      dnd: {
        // Drag and drop configuration, disable:
        // - Node copy on drag
        // - Load nodes on hover while dragging
        // - Multiple node drag
        // - Root node drag
        copy: false,
        open_timeout: 0,
        drag_selection: false,
        is_draggable: function (nodes) {
          return nodes[0].parent !== "#";
        },
      },
      core: {
        data: {
          url: function (node) {
            // Get results
            var queryString =
              "?nodeLimit=" + (pager.getSkip() + pager.getLimit());

            return node.id === "#"
              ? window.location.pathname.match("^[^;]*")[0] +
                  pathToApi +
                  queryString
              : node.a_attr.href + pathToApi;
          },
          data: function (node) {
            return node.id === "#"
              ? { firstLoad: true }
              : {
                  firstLoad: false,
                  referenceCode: node.original.referenceCode,
                };
          },

          dataFilter: function (response) {
            // Data from the initial request for hierarchy data contains
            // additional data relating to paging so we need to parse to
            // differentiate it.
            var data = JSON.parse(response);

            // Note root node's href and set number of available items to page through
            if (pager.rootId == "#") {
              pager.rootId = data.nodes[0].id;
              pager.setTotal(data.nodes[0].total);
            }

            // Allow for both styles of nodes
            if (typeof data.nodes === "undefined") {
              // Data is an array of jsTree node definitions
              return JSON.stringify(data);
            } else {
              // Data includes both nodes and the total number of available nodes
              return JSON.stringify(data.nodes);
            }
          },
        },
        check_callback: function (
          operation,
          node,
          node_parent,
          node_position,
          more
        ) {
          // Operations allowed:
          // - Before and after drag and drop between siblings
          // - Move core operations (node drop event)
          return (
            operation === "create_node" ||
            (operation === "move_node" &&
              (more.core ||
                (more.dnd &&
                  node.parent === more.ref.parent &&
                  more.pos !== "i")))
          );
        },
      },
    };

    function scrollToActive() {

      var $activeNode;

      $activeNode = $('li > a.jstree-clicked')[0];
      //$activeNode = $('li[selected_on_load="true"]')[0];

      //console.log($('li[selected_on_load="true"]').length);
      //console.log($('li > a.jstree-clicked').html());
      pager.updateMoreLink($moreButton, $resetButton);
  
      // Override default scrolling
      if ($activeNode !== undefined) {
        $activeNode.scrollIntoView(false);
        //$("body")[0].scrollIntoView(true);
      }
      //console.log($fwTreeView.jstree("get_selected"));
    };

    // Declare listeners
    // On ready: scroll to active node
    var readyListener = function () {
      scrollToActive();
    };

    // On node selection: load the informationobject's page and insert the current page
    var selectNodeListener = function (e, data) {
      console.log("SB select node event fired.");
      // Open node if possible
      data.instance.open_node(data.node);

      // When an element is clicked in the tree ... fetch it up
      //window.location = window.location.origin + data.node.a_attr.href
      var url = data.node.a_attr.href;

      console.log('SB url:' + url);
      console.log($fwTreeView.jstree("get_selected"));

      $.get(url, function (response) {
        //$("body").html(response);
        //console.log($("div.container-xxl"));
        //console.log($("div.container-xxl", response));
        //$("div.container-xxl").html($("div.container-xxl", response).html())
        //var source = $('' + response + '');

        //var $treeview = $("div#fullwidth-treeview-row");
        //var $treeview = $("div#fullwidth-treeview");

        //console.log($("div#fullwidth-treeview").html());
        
        
        //$fwTreeView.jstree(true).destroy();
        //$fwTreeView = $('<div id="fullwidth-treeview"></div>');
        //$fwTreeViewRow = $('<div id="fullwidth-treeview-row"></div>');
        //console.log($fwTreeViewRow.html());

        response = $(response);
        //console.log(response.find("div.row").html());
        
        
        
        //console.log(response.find("#wrapper"));
        //document.write(response.find("div.container-xxl").html());
        //$("div.container-xxl").html($(response.find("div.container-xxl").html()))
        //$("div.container-xxl").html($(response.find("#main-column h1")))

        /*$("div.row")
          .first()
          .replaceWith($(response.find('div.row').first()));*/

        console.log("SB replacing html");

        //$("div#wrapper")
        //  .first()
        //  .replaceWith($(response.find('div#wrapper').first()));

        //$("#sidebar").remove();

        //$("div.row").append($(response.find('div#sidebar').first()));

        //$("#sidebar")
        //  .first()
        //  .replaceWith($(response.find('div#sidebar').first()));

        $("#main-column")
          .first()
          .replaceWith($(response.find('div#main-column').first()));

        //loadTreeView();

        $mainHeader = $("#main-column h1").first();

        $mainHeader.before($resetButton);
        $mainHeader.before($moreButton);

        $mainHeader.after(
          $fwTreeViewRow
            .append($fwTreeView)
            //.animate({ height: "200px" }, 500)
            .resizable({ handles: "s" })
        );


        // Optionally wrap treeview in a collapsible container
        if (treeViewCollapseEnabled) {
          makeFullTreeviewCollapsible($treeViewConfig, $mainHeader, $fwTreeViewRow);
        }
        /*
        $mainHeader.after(
          $treeview
        );
        */
        //console.log(options);

        $fwTreeView
          .jstree(options)
          .on("ready.jstree", readyListener)
          .on("select_node.jstree", selectNodeListener)
          .on("hover_node.jstree", hoverNodeListener)
          .on("open_node.jstree", openNodeListener)
          .on("move_node.jstree", moveNodeListener);



        console.log("SB replacing html DONE");

        scrollToActive();
        //$fwTreeView.jstree("get_selected")[0].scrollIntoView(true);

//#wrapper
        // keep header
        // target container xxl div - wraps from heading to the action items

/*

        response = $(response);

        // Insert new content into page
        $("#main-column h1")
          .first()
          .replaceWith($(response.find("#main-column h1").first()));

        // Add empty breadcrumb section if current page has none, but response does
        if (
          !$("#breadcrumb").length &&
          $(response.find("#breadcrumb").length)
        ) {
          var breadcrumbDestinationSelector = treeViewCollapseEnabled
            ? ".full-treeview-section"
            : "#fullwidth-treeview-row";

          $(breadcrumbDestinationSelector).after(
            $("<nav>", { id: "breadcrumb" })
          );
        }
        $("#breadcrumb").replaceWith($(response.find("#breadcrumb")));

        // Replace description content
        $("#main-column .row").replaceWith(
          $(response.find("#main-column .row"))
        );

        // If translation links exist in the response page, create element, if necessary,
        // and replace translation links in the current page with them
        if (
          response.find(".translation-links").length &&
          !$(".translation-links").length
        ) {
          $("#breadcrumb").after(
            $('<div class="btn-group translation-links"></div>')
          );
        }
        $(".translation-links").replaceWith(
          $(response.find(".translation-links"))
        );
*/

        // Replace error message
        $("#main-column > .alert").remove();
        $("#breadcrumb").before(response.find("#main-column > .alert"));

        // Attach the Drupal Behaviour so blank.js does its thing
        Drupal.attachBehaviors(document);

        // Update clipboard buttons
        /*if (jQuery("#clipboard-menu").data("clipboard") !== undefined) {
          jQuery("#clipboard-menu").data("clipboard").updateAllButtons();
        }*/

        // Update the url, TODO save the state
        window.history.pushState(null, null, url);
      });
    };

    // On node hover: configure tooltip. A reminder is needed each time
    // a node is hovered to make it appear after node changes. It must
    // use the #fullwidth-treeview container to allow a higher
    // height than the node in multiple lines tooltips
    var hoverNodeListener = function (e, data) {
      $("a.jstree-anchor").tooltip({
        delay: 250,
        container: "#fullwidth-treeview",
      });
    };

    // On node open: remove tooltip after a node is selected, the
    // node is reloaded and the first tooltip is never removed
    var openNodeListener = function (e, data) {
      $("#fullwidth-treeview .tooltip").remove();
    };

    // On node move: remove persistent tooltip and execute
    // Ajax request to update the hierarchy in the backend
    var moveNodeListener = function (e, data) {
      $("#fullwidth-treeview .tooltip").remove();

      // Avoid request if new and old positions are the same,
      // this can't be avoided in the check_callback function
      // because we don't have both positions in there
      if (data.old_position === data.position) {
        return;
      }

      var moveResponse = JSON.parse(
        $.ajax({
          url:
            data.node.a_attr.href + "/informationobject/fullWidthTreeViewMove",
          type: "POST",
          async: false,
          data: {
            oldPosition: data.old_position,
            newPosition: data.position,
          },
        }).responseText
      );

      // Show alert with request result
      if (moveResponse.error) {
        $(
          '<div class="alert">' +
            '<button type="button" data-dismiss="alert" class="close">&times;</button>'
        )
          .append(moveResponse.error)
          .prependTo($("#wrapper.container"));

        // Reload treeview if failed
        data.instance.refresh();
      } else if (moveResponse.success) {
        $(
          '<div class="alert">' +
            '<button type="button" data-dismiss="alert" class="close">&times;</button>'
        )
          .append(moveResponse.success)
          .prependTo($("#wrapper.container"));
      }
    };

    console.log("SB initializing jstree");
    // Initialize jstree with options and listeners
    $fwTreeView
      .jstree(options)
      .on("ready.jstree", readyListener)
      .on("select_node.jstree", selectNodeListener)
      .on("hover_node.jstree", hoverNodeListener)
      .on("open_node.jstree", openNodeListener)
      .on("move_node.jstree", moveNodeListener);

    // Clicking "more" will add next page of results to tree
    $moreButton.on("click", function () {
      pager.next();
      pager.getAndAppendNodes(function () {
        // Queue is empty so update paging link
        pager.updateMoreLink($moreButton, $resetButton);
      });
    });

    // Clicking reset link will reset paging and tree state
    $("#fullwidth-treeview-reset-button").on("click", function () {
      pager.reset($moreButton, $resetButton);
    });

    // TODO restore window.history states
    $(window).on("popstate", function () {});
  }
})(jQuery);
