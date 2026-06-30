  $(function () {
    setTabIndex();

    var conditionsOfUseVer = "1.1", privacyPolicyVer = "1.1";
    var ua = navigator.userAgent.toLowerCase();
    var params = location.href.split('?');
    var moduleType = '';

		if (params.length > 1) {
	    var urlParams = params[1].split('&');
	    for (var iter=0; iter<urlParams.length; iter++) {
	      if (urlParams[iter].indexOf('moduleType') != -1) {
	        moduleType = urlParams[iter].split('=')[1];
	        break;
	      }
	    }
	  }

    var checkAgree = function () {
      if ($("#checker1").is(":checked") && $("#checker2").is(":checked") && $("#checker3").is(":checked")) return true;
      else {
        alert("모든 약관에 동의해주십시오.");
        return false;
      }
    }
    
    if (moduleType != 'web') {
    	if (ua.indexOf('android') > -1) {
	      $('.okBtn').click(function () {
	        if (checkAgree()) window.conditionsOfUse.agree(conditionsOfUseVer, privacyPolicyVer);
	      });
	
	      $('.cancelBtn').click(function () {
	        window.conditionsOfUse.cancel();
	      });
	    } else if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 || ua.indexOf("ipod") > -1) {
	      $('.okBtn').click(function () {
	        if (checkAgree()) {
	          var pram = {
	            "agree": true,
	            "conditionsOfUseVer": conditionsOfUseVer,
	            "privacyPolicyVer": privacyPolicyVer
	          };
	
	          webkit.messageHandlers.conditionsOfUse.postMessage(pram);
	        }
	      });
	
	      $('.cancelBtn').click(function () {
	        var pram = {
	          "agree": false
	        };
	
	        webkit.messageHandlers.conditionsOfUse.postMessage(pram);
	      });
	    } else {
	      $('.okBtn').click(function () {
	        if (checkAgree()) {
	          location.href = 'app://ok?terms_of_user_ver=' + conditionsOfUseVer + 
	          	'&privacy_agree_ver=' + privacyPolicyVer;
	        }
	      });
	
	      $('.cancelBtn').click(function () {
	        location.href = 'app://cancel';
	      });
	    }
    } else {
      $('.okBtn').click(function () {
        if (checkAgree()) {
          var pram = {
            "agree": true,
            "conditionsOfUseVer": conditionsOfUseVer,
            "privacyPolicyVer": privacyPolicyVer
          };
          window.parent.postMessage(JSON.stringify(pram), '*');
        }
      });

      $('.cancelBtn').click(function () {
        var pram = {
          "agree": false
        };
        window.parent.postMessage(JSON.stringify(pram), '*');
      });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    function setTabIndex(){

      var indexNum = 1;

      //default
      $('.plcyWrap').attr('tabindex', indexNum++);
      $('h1').attr('tabindex', indexNum++);
      $('#clauseTit').attr('tabindex', indexNum++);

      //이용약관 동의
      indexNum = 100;
      $('#checker1').attr('tabindex', indexNum++);
      $('#checker1').attr('title', '이용약관 동의 체크박스');
      $('#detail1').attr('tabindex', indexNum++);
      $('#detail1').attr('title', '상세보기 버튼');

      $('#clauseTit').attr('tabindex', indexNum++);
      $('#tit_sub ul li').attr('tabindex', indexNum++);
      $('#tit_sub1').attr('tabindex', indexNum++);
      $('#tit_sub1').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit_sub2').attr('tabindex', indexNum++);
      $('#tit_sub2').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub2').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit_sub2').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit_sub2').next().children('li:eq(3)').attr('tabindex', indexNum++);
      $('#tit_sub2').next().children('li:eq(4)').attr('tabindex', indexNum++);

      $('#tit_sub3').attr('tabindex', indexNum++);
      $('#tit_sub3').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit_sub4').attr('tabindex', indexNum++);
      $('#tit_sub4').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit_sub5').attr('tabindex', indexNum++);
      $('#tit_sub5').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub5').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit_sub5').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit_sub5').next().children('li:eq(3)').attr('tabindex', indexNum++);
      $('#tit_sub5').next().children('li:eq(4)').attr('tabindex', indexNum++);
      
      $('#tit_sub6').attr('tabindex', indexNum++);
      $('#tit_sub6').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub6').next().children('li:eq(1)').attr('tabindex', indexNum++);

      $('#tit_sub7').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(3)').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(4)').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(5)').attr('tabindex', indexNum++);
      $('#tit_sub7').next().children('li:eq(6)').attr('tabindex', indexNum++);

      $('#tit_sub8').attr('tabindex', indexNum++);
      $('#tit_sub8').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub8').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit_sub8').next().children('li:eq(2)').attr('tabindex', indexNum++);

      $('#tit_sub9').attr('tabindex', indexNum++);
      $('#tit_sub9').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit_sub10').attr('tabindex', indexNum++);
      $('#tit_sub10').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit_sub11').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(3)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(4)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(5)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(6)').attr('tabindex', indexNum++);
      $('#tit_sub11').next().children('li:eq(7)').attr('tabindex', indexNum++);
    
      $('#tit_sub12').attr('tabindex', indexNum++);
      $('#tit_sub12').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub12').next().children('li:eq(1)').attr('tabindex', indexNum++);

      $('#tit_sub13').attr('tabindex', indexNum++);
      $('#tit_sub13').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub13').next().children('li:eq(1)').attr('tabindex', indexNum++);

      $('#tit_sub14').attr('tabindex', indexNum++);
      $('#tit_sub14').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit_sub14').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit_sub14').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit_sub14').next().children('li:eq(3)').attr('tabindex', indexNum++);

      $('#addendum').children('h4:eq(0)').attr('tabindex', indexNum++);
      $('#addendum').find('p:eq(0)').attr('tabindex', indexNum++);

      $('#addendum').children('h4:eq(1)').attr('tabindex', indexNum++);
      $('#addendum').find('p:eq(1)').attr('tabindex', indexNum++);
      $('#addendum').find('p:eq(2)').attr('tabindex', indexNum++);

      $('#addendum').children('h4:eq(2)').attr('tabindex', indexNum++);
      $('#addendum').find('p:eq(3)').attr('tabindex', indexNum++);
      $('#addendum').find('p:eq(4)').attr('tabindex', indexNum++);
    
      // 개인정보 수집 및 이용
      indexNum = 200;
      $('#checker2').attr('tabindex', indexNum++);
      $('#checker2').attr('title', '개인정보 수집 및 이용 동의 체크박스');
      $('#detail2').attr('tabindex', indexNum++);
      $('#detail2').attr('title', '상세보기 버튼');  

      $('#clauseTit2').attr('tabindex', indexNum++);
      $('#tit2_sub0 ul li').attr('tabindex', indexNum++);
      $('#tit2_sub1').attr('tabindex', indexNum++);
      $('#tit2_sub1').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit2_sub1').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit2_sub1').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit2_sub1').next().children('li:eq(3)').attr('tabindex', indexNum++);

      $('#tit2_sub2').attr('tabindex', indexNum++);
      $('#tit2_sub2').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit2_sub2').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit2_sub2').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit2_sub2').next().children('li:eq(3)').attr('tabindex', indexNum++);

      $('#tit2_sub3').attr('tabindex', indexNum++);
      $('#tit2_sub3').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit2_sub3').next().children('li:eq(1)').attr('tabindex', indexNum++);
      $('#tit2_sub3').next().children('li:eq(2)').attr('tabindex', indexNum++);
      $('#tit2_sub3').next().children('li:eq(3)').attr('tabindex', indexNum++);

      $('#tit2_subExt2').next().children('li:eq(0)').attr('tabindex', indexNum++);

      //개인정보 제3자 동의
      indexNum = 300;
      $('#checker3').attr('tabindex', indexNum++);
      $('#checker3').attr('title', '개인정보 제3자 제공에 대한 동의(필수) 체크박스');
      $('#detail3').attr('tabindex', indexNum++);
      $('#detail3').attr('title', '상세보기 버튼');  

      $('#clauseTit3').attr('tabindex', indexNum++);
      $('#tit3_sub0 ul li').attr('tabindex', indexNum++);
      $('#tit3_sub1').attr('tabindex', indexNum++);
      $('#tit3_sub1').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit3_sub2').attr('tabindex', indexNum++);
      $('#tit3_sub2').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit3_sub3').attr('tabindex', indexNum++);
      $('#tit3_sub3').next().children('li:eq(0)').attr('tabindex', indexNum++);

      $('#tit3_sub4').attr('tabindex', indexNum++);
      $('#tit3_sub4').next().children('li:eq(0)').attr('tabindex', indexNum++);
      $('#tit3_sub4').next().children('li:eq(1)').attr('tabindex', indexNum++);

      $('#tit3_subExt1').next().children('li:eq(0)').attr('tabindex', indexNum++);

      indexNum = 400;
      $('#cbx_chkAll').attr('tabindex', indexNum++);
      $('#cbx_chkAll').attr('title', '전체 동의하기 체크박스');

      $('.cancelBtn').attr('title', '취소 버튼');
      $('.cancelBtn').attr('tabindex', indexNum++);
      $('.okBtn').attr('title', '확인 버튼');
      $('.okBtn').attr('tabindex', indexNum++);
    }

    function isAllChecked() {
      let allChecked = false;
      if($('#checker1').is(':checked') && $('#checker2').is(':checked') && $('#checker3').is(':checked')){
        allChecked = true;
      }
      return allChecked;
    }
    
    function toggleAllChecked() {
      if(isAllChecked()){
          $('#cbx_chkAll+label').css('background-image', 'url(../UI/images/check_on.svg)');
          $('#cbx_chkAll').prop("checked", true);
        }else{
          $('#cbx_chkAll+label').css('background-image', 'url(../UI/images/check_off.svg)');
          $('#cbx_chkAll').prop("checked", false);
        }
    }
    
    $('#checker1, #checker2, #checker3, #cbx_chkAll').click(function(){
        let checkerLabel = '#' + $(this).attr('id') + '+label';

        if($(this).attr('id') == 'cbx_chkAll'){
          if($(this).is(':checked')){
            $('#checker1').prop("checked", true);
            $('#checker2').prop("checked", true);
            $('#checker3').prop("checked", true);

            $('.policy2').css('display', 'none');
            $('#checker1+label').css('background-image', 'url(../UI/images/check_on.svg)');
            $('#checker2+label').css('background-image', 'url(../UI/images/check_on.svg)');
            $('#checker3+label').css('background-image', 'url(../UI/images/check_on.svg)');
            $('#cbx_chkAll+label').css('background-image', 'url(../UI/images/check_on.svg)');
          }
          else{
            $('#checker1').prop("checked", false);
            $('#checker2').prop("checked", false);
            $('#checker3').prop("checked", false);

            $('#checker1+label').css('background-image', 'url(../UI/images/check_off.svg)');
            $('#checker2+label').css('background-image', 'url(../UI/images/check_off.svg)');
            $('#checker3+label').css('background-image', 'url(../UI/images/check_off.svg)');
            $('#cbx_chkAll+label').css('background-image', 'url(../UI/images/check_off.svg)');
          }
          return;
        }

        if($(this).is(':checked')){
          $(checkerLabel).css('background-image', 'url(../UI/images/check_on.svg)');
        }
        else{
          $(checkerLabel).css('background-image', 'url(../UI/images/check_off.svg)');

          $('#cbx_chkAll').css('outline', 'none');
          $('#cbx_chkAll+label').css('background-image', 'url(../UI/images/check_off.svg)');
        }

        toggleAllChecked();
     });

    $('#checker1, #checker2, #checker3, #cbx_chkAll').focus(function(){
      let checkerLabel = '#' + $(this).attr('id') + '+label';
      
      $(checkerLabel).css('border', '1px solid black');
    });

    $('#checker1, #checker2, #checker3, #cbx_chkAll').blur(function(){
        let checkerLabel = '#' + $(this).attr('id') + '+label';
        //기존으로 color로 되돌리기
        $(checkerLabel).css('border', '');
     });

    $('#checker1, #checker2, #checker3, #cbx_chkAll, .detailBtn').keydown(function(key){
        if(key.keyCode == 13){
          $(this).click();
            key.preventDefault();
        }
    });

  // 외부 -> 내부, 내부-> 외부 iframe 간 포커스 이동 제어
  // domain 이 다를 경우 CORS 에러 발생
    $('[tabindex=9999]', window.parent.document).keydown(function(key){
        if(key.keyCode == 9){
          $("[tabindex=1]").focus();
          key.preventDefault();
        }
    });

    $('.okBtn').keydown(function(key){
      if(key.keyCode == 9){
          $('[tabindex=9904]', window.parent.document).focus();
          key.preventDefault();
        }
    });

    $('.detailBtn').click(function(e){
      if($(e.target).parent().next().css('display') == 'block'){
        $(e.target).parent().next().css('display', 'none');
        return;
      }

      $('.policy2').css('display', 'none');
      $(e.target).parent().next().css('display', 'block');
    });

    $("#detail1").click();
    $("[tabindex=1]").focus();

  });