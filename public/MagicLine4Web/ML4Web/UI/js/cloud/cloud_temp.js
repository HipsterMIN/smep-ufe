function UI_CONN(callback, errorcallback) {
  var callback = callback;
  var errorcallback = errorcallback;
  var doc = document.createElement('fieldset');
  doc.setAttribute('id', 'CLUD_01');
  doc.setAttribute('class', 'clud_cert_box');

  var html = '';
	html += '<div class="clud_cert_area">';
	html += '    <div class="clud_tit">클라우드 인증서비스를 시작합니다</div>';
	html += '    <div class="CLUD_input_wrap">';
	html += '        <label for="CLUD_name">이름</label>';
	html += '        <input type="text" placeholder="홍길동" id="CLUD_name" name="CLUD_name" autocomplete="on">';
	html += '    </div>';
	html += '    <div class="CLUD_input_wrap">';
	html += '        <label for="CLUD_phone">휴대폰번호</label>';
	html += '        <input type="text" placeholder="01012345678" id="CLUD_phone" name="CLUD_phone" autocomplete="on">';
	html += '    </div>';
	html += '    <div class="CLUD_input_wrap">';
	html += '        <label for="CLUD_birth">생년월일</label>';
	html += '        <input type="text" placeholder="20010101" id="CLUD_birth" name="CLUD_birth" autocomplete="on">';
	html += '    </div>';
	html += '    <div class="clud_chk_wrap">';
	html += '        <label for="chk"><input type="checkbox" id="chk"><span class="clud_chk_txt">자동연결하기</span></label>';
	html += '    </div>';
	html += '    <div class="clud_btn_wrap">';
	html += '        <span class="clud_btn_row">';
	html += '            <p class="clud_grey_btn"><button type="button" id="CLUD_01_cancel"><span>취소</span></button></p>';
	html += '            <p class="clud_blue_btn"><button type="button" name="okBtn" id="cloud_btn_conn"><span>확인</span></button></p>';
	html += '        </span>'; 
	html += '    </div>';
	html += '</div>';  
  
  doc.innerHTML = html;
  document.body.appendChild(doc);
  
  id_coll('CLUD_01_cancel').addEventListener('click', function () {
	  var temp_id = id_coll('CLUD_01');
	  cancle_click(temp_id);
  });
  
  id_coll('cloud_btn_conn').addEventListener('click', function () {
    var name = id_coll('CLUD_name').value;
    var phone = id_coll('CLUD_phone').value;
    var birthday = id_coll('CLUD_birth').value;
    var autoConn = id_coll('chk').checked;

    id_coll('CLUD_01').parentElement.removeChild(id_coll('CLUD_01'));
    callback(name, phone, birthday, autoConn);
  });
}

  /**
   * 약관 iframe 커스텀
   */
   /*
  function UI_JOIN(iframe, url) {
      iframe.setAttribute('src', url + '?moduleType=web');
      iframe.setAttribute('id','cloud_iframe');
      iframe.setAttribute('width', '320px');
      iframe.setAttribute('height', '327px');

      iframe.style.position = 'fixed';
      iframe.style.top = '32%';
      iframe.style.left = '35%';
      iframe.style.zIndex = '20000';
      iframe.style.border = '1px solid';
      
      return iframe;
  }*/
  
  function UI_JOIN(iframe, url) { 
	  
	  var doc = document.createElement('fieldset');
	  doc.setAttribute('id', 'CLUD_03');
	  doc.setAttribute('class', 'clud_cert_box');
	
	  var html = '';
		html += '<div class="clud_cert_area">';
		html += '    <div class="clud_tit">클라우드 공동인증서비스<br>회원가입 및 인증서 등록 방법</div>';
		html += '    <div class="clud_join_wrap">';
		html += '        <span class="clud_info">클라우드 공동인증서 사용하기 위해선, 반드시 기존 공동인증서 또는 신규 공동인증서를 발급 받아 클라우드에 등록 후 사용해야 합니다.</span>';
		html += '        <span class="clud_btn_row_full">';
		html += '            <p class="clud_blueline_btn_full"><button type="button" onClick="window.open(\'https://www.signkorea.com/certificate/application/application_idx.jsp\')" id=""><span>등록 방법</span></button></p>';
		html += '        </span> ';
		html += '        <span class="clud_info_desk">상담 및 문의전화 1577-7337</span>';
		html += '    </div>';
		html += '    <div class="clud_btn_wrap">';
		html += '        <span class="clud_btn_row_full">';
		html += '            <p class="clud_grey_btn_full"><button type="button" id="CLUD_03_cancel"><span>취소</span></button></p>';
		html += '        </span>'; 
		html += '    </div>';
		html += '</div>';
		
	  
	  doc.innerHTML = html;
	  document.body.appendChild(doc);
	  
	  id_coll('CLUD_03_cancel').addEventListener('click', function () {
		  var temp_id = id_coll('CLUD_03');
		  cancle_click(temp_id);
	  });
	  
  	  iframe.setAttribute('src', url + '?moduleType=web');
      iframe.setAttribute('id','cloud_iframe');
      iframe.style.display = 'none';
      return iframe;	  
  }
  
  function closePop(){
    id_coll('cloud_iframe').remove();
  }

  function UI_MO(auth_code, auth_code_time, status, callback, errorcallback) {
    var callback = callback;
    var errorcallback = errorcallback;

    var doc = document.createElement('fieldset');
    doc.setAttribute('id', 'CLUD_02');
	doc.setAttribute('class', 'clud_cert_box');

    var html = '';
	html += '<div class="clud_cert_area">';
	html += '    <div class="clud_tit">SMS 문자를 받으신 후<br>확인코드 숫자를 입력해 주세요</div>';
	html += '    <div class="CLUD_code_input_wrap">';
	html += '		 <label for="CLUD_code">확인코드</label>';
	html += '		 <span id="code" class="CLUD_code">' + auth_code + '</span>';
	//html += '        <span id=code><font style=font-weight:bold;font-size:30pt;>' + auth_code + '</font></span>';
	html += '    </div>';
	html += '    <div class="clud_time_wrap">';
	html += '        <span class="clud_time_txt_wrap">남은시간 <span class="clud_time_txt" id="authtime">05:42</span></span>';
	html += '    </div>';
	html += '    <div class="clud_btn_wrap">';
	html += '        <span class="clud_btn_row">';
	//html += '            <p class="clud_grey_btn"><button type="button" id="CLUD_02_cancel"><span>취소</span></button></p>';
	html += '            <p class="clud_blue_btn"><button type="button" name="okBtn" id="btn_mo" class="disabled" style="width:275px;"><span>확인</span></button></p>';
	html += '        </span>'; 
	html += '    </div>';
	html += '</div>';    
    
    doc.innerHTML = html;
    document.body.appendChild(doc);
    
    var d2 = new Date(auth_code_time.replace(/[.-]/gi, "/")).getTime();
    var d1 = new Date().getTime();

    var time = (d2 - d1) / 1000;
    var m, s;
    
    var moInterval = setInterval(function () {
      time -= 1;

      m = ('0' + parseInt(time / 60));
      s = ('' + parseInt(time % 60));
      s = s.length == 1 ? '0'+s : s;
      id_coll('authtime').innerText = m + ':' + s;
      
      if (time == 0) clearInterval(moInterval);
      
      var statusRes = status();
      /*
        5201 인증번호 맞지 않음 (error count 증가된거 보여주고 진행)
        5202 타임아웃 (클라이언트 에러 처리)
        5203 진행중
        5204 검증 실패 (클라이언트 에러 처리)
      */
      switch (statusRes['code']) {
        case 0:
          id_coll('btn_mo').removeAttribute('disabled');
          id_coll('btn_mo').className = 'abled';
          break;
        case 5201:
          ML4WebDraw.errorHandler("main", "오류코드 : 5201 <br>오류메시지 : 인증번호 맞지 않음 <br>에러카운트 : "+statusRes['error_count'], null, null);
          break;
        case 5202:
          ML4WebDraw.errorHandler("main", "오류코드 : 5202 <br>오류메시지 : 인증번호 맞지 않음 <br>에러카운트 : "+statusRes['error_count'], null, null);
          clearInterval(moInterval);
          break;
        case 5203:
          break;
        case 5204:
          errorcallback('Verify fail!');
          clearInterval(moInterval);
          break;         
      }
    }, 1000);

    id_coll('btn_mo').addEventListener('click', function () {
      id_coll('CLUD_02').parentElement.removeChild(id_coll('CLUD_02'));
      callback();
      clearInterval(moInterval);
    });
  }

function UI_CERT_SELECT(callback, errorcallback) {
      var callback = callback;
      var errorcallback = errorcallback;
      // sample cert
      var certByteList = [];
      var certObjList = [];
      // #1
      certByteList.push({
        cert: 'MIIFnjCCBIagAwIBAgIDCFqlMA0GCSqGSIb3DQEBCwUAMFUxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkGA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E1MB4XDTIxMDUxMzA3MzkwMFoXDTIyMDUxMzE0NTk1OVowgYQxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExGDAWBgNVBAsMD+2FjOyKpO2KuOyXheyihTEYMBYGA1UECwwP7YWM7Iqk7Yq47ZqM7IKsMRgwFgYDVQQLDA/thYzsiqTtirjsp4DsoJAxEzARBgNVBAMMCmtvc2NvbTc4MzUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDzdiwMFd8Hkfd+m1HSmSTZjIwnnpFhjkPjtdVcqI/7Le5/7y4JoEflaV46KcIw51z3RX7YVLPaS1CItTGtmCzlKx9Y07WJINxrMkyNRNy1YC1Ab0IzQ8IUkYdL/dYbdAPpiUSLEUBoYg5R5RasSzxF+9nxVvnOhKfugHylBUv72Qp54nElLdy4fWkp9ULD5ipVPVw5dHtQo+xWLB8jMIqnKd1GVYzhf5p9mkQsQ7FmpEYYmxiCGKOYu0tsXwH7tzbRGUHrMA2LXJULzw4/A8KGJhTRuHqirVtxRgg1QzoaL+EhadiWANc7Tzjmt5cvaB6HqY+BT2WFogqhcQqa6Aw9AgMBAAGjggJFMIICQTCBkwYDVR0jBIGLMIGIgBTxcKmvb8+di6yBhcwW9HzZhVwMxKFtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgN4IBBTAdBgNVHQ4EFgQU4gzS6dK3XzEfA/efEads/nZyehgwDgYDVR0PAQH/BAQDAgbAMHsGA1UdIAEB/wRxMG8wbQYKKoMajJpEBQEBBzBfMC0GCCsGAQUFBwIBFiFodHRwOi8vd3d3LnNpZ25rb3JlYS5jb20vY3BzLmh0bWwwLgYIKwYBBQUHAgIwIh4gx3QAIMd4yZ3BHAAgwtzV2MapACDHeMmdwRzHhbLIsuQwaQYDVR0RBGIwYKBeBgkqgxqMmkQKAQGgUTBPDAprb3Njb203ODM1MEEwPwYKKoMajJpECgEBATAxMAsGCWCGSAFlAwQCAaAiBCA9CtA+en9D6AtduGFWoapBqSr6G1Qcamrf1wY9vCSizDBWBgNVHR8ETzBNMEugSaBHhkVsZGFwOi8vMjExLjE3NS44MS4xMDI6Njg5L291PWRwMTFwMTIsb3U9QWNjcmVkaXRlZENBLG89U2lnbktvcmVhLGM9S1IwOgYIKwYBBQUHAQEELjAsMCoGCCsGAQUFBzABhh5odHRwOi8vMjExLjE3NS44MS4xMDEvb2NzcC5waHAwDQYJKoZIhvcNAQELBQADggEBAAOvSaBhbBKX4+aHe7G207kZmrq6pBQiaXpI0dR7t2Z3HhIYgZSpv6i0fAYHzzRvPv8HEAf973hYwo0rHG6J6e2smZnuv/9Cego+N/FonO/7cTTuj2roWINzo0H4Cj9TvathmU5VRE0vSaOxeJItohCaMADD9gjhJ/dZJ3R86g1wwRERGx2bQkWqoz8Ive341qEjhnC0iLcaj2BYUtOLq9CwOb72XoS4pN2Z5qqtRIgijy5/CknorgQ3py4j92s4O43FC1xXH8hFF8ZAQZrgdddfrhLHujS8l+qAXFR3i94Rxp968oyu4QcGkz7dEU0AcWSHueoavYylktbj9xcagaE=',
        key: 'MIIFPjBIBgkqhkiG9w0BBQ0wOzAbBgkqhkiG9w0BBQwwDgQIF5bZNQn/GgACAggAMBwGCCqDGoyaRAEEBBAIFIih0daLPl6/eDkeXvRPBIIE8LQgvdRH5Z9OcUvRMJB40tXQ44yv2ZrnVQ+X1rq01RumAWf/7fU8y1R1dCW0cpBJK37VVRz8Jv+txyEqvAa2XZ2cjSEa8I7FpK/5ZhAN708V+ZMa5FJ8s+SpReEFtrlR/ikIUXEOOCrAYFgaUuyKoAN/XHLJV9H7ViCFotAUIz9SLGjVd1ab/SQJYFKlPfxmF7ejZga3bnLniSbkHVRVINshyMcSzJADzUEh4yznzzclje/ffwTXEuwnARGWMdoxdTcvLErlSs+9uiKFDHpyjslNtj/IxHi+0auDh1V2GbrsRI30KOGdKvgIVIa8pJRMdBX6YpSN5A4pqCsMjrBhdUT/OVHiJ1nySHObVHR/nFvX6AE6Qp/ezSqUH342eWZupZG+uPlDz3s/caHrtwPBjOYBDnnyUsjqlhCloW6lE8ciruDcbr7yOm0E55Els0dr6ZCeHYKSW3B5n+pEx1s1PIQCAs9AsSqYXrhRgh3McQMKYvJKWgPEgSXFM5ZJiwgP/Nqjd8ldtTzlsLRl81lkwsLGWWTSnEyoJsv/Ls1yxuZ+aXdkGiEcT4QLI8ERaUfraadMt07VowkcVXkHhyzPmORzmfW5yvjER0agwnt2VME2Ao46/Fbmz+1+2+26bKmdgAc/64WpkZmPrlz5QlkJcwdZVjJ95ZhMLctpnzA+QYW9fAdK1c6+jfDbtlYB298MyMKGYl39EKUET3/L9UAzOK51KgDL8YtfOPVi2EGY53SvESV6K1n9ONBffljT9lXlsqIyCiLCISp6nal70LRgivk9cSCZoIKmmXKx79mH5TRQsLFKG/A9owjbFmNjCV8v0eK89ED6ilBt2IbLRw+3IDIEk4glI8m3wCqOFARspr30n8iM8+9sIapz40GM5B3Xj4bRdNDfPHJSCE0h5lkwpb1uL03ctltiX9HzJ/pYp8jw+OBqtj3/5zO77gJ873bgj7d6LCm8vLWdy+ky/1pddPf1V3c18jR1RvK6pltXf/3BEvitRBxsn9GnLStxckZciL1OOHJc1Nt9Xmh89dq+/pYZf9f2H7/y51bW5yAA1NPfY4e0YwXqObAraHdEfKdWTnzK3ESoTENZ+pQ1PvWwdC+fN94IwQ9o1atUcv8OORcPxIC0Q2UU4pXH1KvycwFocrasOhbVy14C4pgk+KzqGmjYrRPvGzSvyRyV7aB2DcQVcPUCcDvv7xk/imTO1wMrwEeKJvao0aJhKQt75JJRugCsjuJ8qiGe1UNKBMM/JUtcm9oRs8oQ1PT7EP11LpnNQKHBtKx0h6n+5bdgLL+/dlr/ssRQOqbZEXrH07j3PKNrUVtXXGPE0GuUSuc5I1pg4qRVl0ifmpKd+8ioU5z2Ot1WZqk3fxVuCFpmc0PLR3crkNdfmHzkRH22CDoC5mIP6bj9f+6AACqApeQL6LAV2Mq1M6J0USdkot2W1s85b22w52znX5a/KO/sUa374KuG7jwVpNoJqeqf57O6L0UECWTN4qaYcz28Fz5rOF9DGmW2Lrkg2KLMqksOdPdSTL/V1jNY7gsDAqIi8WXm8ITaD1fmJuuXDLaPtz0VnCyb/L8sALL/52/3K0yIAxoxkXGULzp8T5ZI4DSbuvZEizwewbvt/TGY1//xEFs3B3YT3A8dRBhiPY5xyDtlVka4k94dLVw88zMtA+q2BQBsFOfV6to=',
        kmcert: 'MIIE0jCCA7qgAwIBAgIDCFqmMA0GCSqGSIb3DQEBCwUAMFUxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkGA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E1MB4XDTIxMDUxMzA3MzkwMFoXDTIyMDUxMzE0NTk1OVowgYQxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExGDAWBgNVBAsMD+2FjOyKpO2KuOyXheyihTEYMBYGA1UECwwP7YWM7Iqk7Yq47ZqM7IKsMRgwFgYDVQQLDA/thYzsiqTtirjsp4DsoJAxEzARBgNVBAMMCmtvc2NvbTc4MzUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDE4EvsyZoyq0lobD14UrxcsfeFpBWe1EIToq7EavTTwBxPOBY4ciyMr+ZAKpEtjXNbVfHsptm7zGnfVb5RMGnLURSHlgzG/7MH6uiNH2UQX/iaCXUsEPZBvM4ZvNUK0ohKW2fFoDJH6LGPXW90x5WUnqzQ/VW4g9ksxJqiktMiJvxjytkmQ3Lc32cJ5yjQSgmKNzmVSjcdVpS4Tik1MEOygzEBcl6P7iICrIrNsCBHx9ziE4rwCfMRLGpxoSAuwTgUvIWQfYwMLPSKKxS1Nh9KT1bZzpa7DIv1Qsu40L+1wDpot+C18tJ53rSj2zmhAIRIpvC7G6uPQFE46qN/iBYxAgMBAAGjggF5MIIBdTCBkwYDVR0jBIGLMIGIgBTxcKmvb8+di6yBhcwW9HzZhVwMxKFtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgN4IBBTAdBgNVHQ4EFgQUkjPcY01+1UDekYYZjN+te1bD2wEwDgYDVR0PAQH/BAQDAgUgMBoGA1UdIAEB/wQQMA4wDAYKKoMajJpEBQEBDTBWBgNVHR8ETzBNMEugSaBHhkVsZGFwOi8vMjExLjE3NS44MS4xMDI6Njg5L291PWRwMTFwMTIsb3U9QWNjcmVkaXRlZENBLG89U2lnbktvcmVhLGM9S1IwOgYIKwYBBQUHAQEELjAsMCoGCCsGAQUFBzABhh5odHRwOi8vMjExLjE3NS44MS4xMDEvb2NzcC5waHAwDQYJKoZIhvcNAQELBQADggEBAGBMutO0v5XJUxoXvT0bCz42S4fFsONYn1CkykAOhbNRRqsEVJ70qA16GutsRLZzeDjtbCvj1TyuH/8h2rBMJ1q7abiu/Q6/IOUXX+WXI3oRNNoUf4od1DF4+ry9aP8RrHMrvLlqWF5OmgziYkc8lmQzngdrxG31UKIHIykBeyEAT1iG+XYEJw6EG7slKIlSAUHbuvHuDstj+0+jtF8zzVKX7WjFcKb/AinACF97sE37k7y2D9Fc6Pw5qOzcU2HEIOQbYKahrhJS7lg7h/leRIbZQTWNECdgytguM+0SgiDvpKepc+pdEMZcroQVExeN7UixSGaImzaDGTYNtUpWegE=',
        kmkey: 'MIIFDjBIBgkqhkiG9w0BBQ0wOzAbBgkqhkiG9w0BBQwwDgQI9q2vDRTvJ58CAggAMBwGCCqDGoyaRAEEBBB7yw3gnHp+MdVToWQXU8LcBIIEwL9ZXwnLwQvl6ENhzZ+eILL3KEZaEOZawviMgUdnEYJd0ZBGQCK+F8AqRhW8ueg75ebyydroGOrzSqcV1tuC4Uytnhv7sFhK9ITJNQ3v4i2ORm0dElGnclZK+AOK3bvQoB8dpDi0zv1HbAiM8twzKiIee16TSfRxNz2oDwIJ+fm2gXPIfkhrjAtJtPFogCdL3Ai4WMtYvkInlMiDR4NqnkC2Qkuuo2TIHY3VKhoJVtylN3y5P/AZ//ii+D8uDzO2Iezbrqv6mEt04myK4c+nyX19xxyVqFbXxvHhNCa7uTqyI//Nb8HtplM6jW1D+Mmbae8tMBRGOCn2UfCcQVvemKr3S5tFThajfuxwKx0BH7F7pLn9pq4XLSRr7U67Ol9VypIuqfjUV+5/163s7xEprs3K/yfg0Bg51ZQk9RChhjuxaXgTC4MPg31J0k0spGjg0Mnhwcg8fsuv0zxfzNPZd6n34BDJqnT0HMy0n/EwaP+eQx2vLkmfOVYKmwPwEs+vFT+e6KgtQgSCFH94DApGnM0q94IgM4pQNp9Au9DvOXisurRytlmp99XOoIp9duy9BtseocsmuIFoHbJy8Od7NQclMXNSkLie6Bk8BNLm6NuSUpDoFA7GngKrIcMd1LtfDClZUZEg7ax2BN3mdKAUXoXMWPu7O/biB++sOkuVIWPnqF0Z709ai3rr8sPyoMPXolAF8HYDsODkZCFu4Zhtn0huAFlSg1eTQZIwpx0KKJhp43oZUHozs8bljDrJZQHrymljgpk3tLaiyu3xaL0NaKmPbz5lRPmXGhdYbZObuPoJbuso65DfH61JXlXvy9rlINL8zKil4SdcnfJErnRJQA+WWCNudvDzJ90E4iF9ermeyQEJQOXLh/sNHE+t4yWtE9o4AQpvPNYedsQ1NFXSIx0A23Xy5XGe7n2zMPXVyyUiFx83ohwJQfea6bEVJ+Fk5tRyuyRzOxhb9bC6CHS3eKy4TM5hpLAn4AbDYcxzZYocuNtQNmZgHFX7lsbeAiYrr6cqhldSe5qPQTFqMrf6Ohn1GRrB6NZTVmyIOvZ2D43Eh9XRmyJq1QTzuk9q6wwOKQWN5UxPgcrINZXJhgaDZ5Sr3OtlFcx7w2Zr6S4vJUclqentVZODWqdCZJv/4HgL66wr7N6146FGVTD99dJZWeRyEx9p+ynnAiQVT1F+xi8Y+DnVSz478CbNtwk1q8DX2FyHniwSCrNPNMjnvUwLz7ohgAsfcrtFniyxZgwdqzxN8gjS8VoLoSJSvn1oET+kIYPtIVDg8PvHKtNNQRgyPuxfpXQdHT00Lg7D9DbRt7xiVdWFPwevDHSS0qeVWdgcEHkM26zCi1SUzwXi9/JYW+aFf5WO35al9LuT0uEPYTYd4eHAy3dscnv7V6zyv07sZMUf7/+zh85fgPJsH33aUWPjZjyb1gW6QO/n7UmjtwlJIUiayX6pcpRSSpmBbAfBUU+wZJdC0yW4JD7mCwBxwYifSoj5rKCBxijCRL5Rv2ksL278vrbGlXX7sNnEQybox+WCslI/7RmhiZe7R3ATdYRiJEFBDdIO+AVfGDltZK9NKktooQ9vQGNwKdLUrcW9YKpydPJSa48bYp9wLRFErR4='
      });
      certObjList.push( yt.pki.Certificate.fromBytes( ytcrypto.util.decode64(certByteList[0].cert) ) );
      // #2
      certByteList.push({
        cert: 'MIIFnjCCBIagAwIBAgIDCFqjMA0GCSqGSIb3DQEBCwUAMFUxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkGA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E1MB4XDTIxMDUxMzA3MzkwMFoXDTIyMDUxMzE0NTk1OVowgYQxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExGDAWBgNVBAsMD+2FjOyKpO2KuOyXheyihTEYMBYGA1UECwwP7YWM7Iqk7Yq47ZqM7IKsMRgwFgYDVQQLDA/thYzsiqTtirjsp4DsoJAxEzARBgNVBAMMCmtvc2NvbTc4MzQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC27Wr1Yi/xaAjkL770tKpuSNE6Dfa8cIsLTrBQAoEVykaLxjeSS9KgNBLpD8Yo33aaAaYPQ/9B3/ZhW178II3DoTSm1B7K3h5l8oqrYJlD0y+LeOg2dS6cVbigjKYbkNG+KNbxc+Fojs9e1G0eK02OAXfwW/mlpwFxKKLkAD5TKGuHC2u8Males6EMB6ZlaGeVsz6CWHmb+Mz1rNsJt0TYwJXuDKBIyyRsa1CnZpvEEMV9UgheY6e29cEmVtpbTJGV9ZDMOhCkbN3l9AZkFfmIUUFQYrbmx7hVXjYQXtfIxqHsAqebXp0Kv+6bDe710WoehphsxCVIZMnJHpP/VR/lAgMBAAGjggJFMIICQTCBkwYDVR0jBIGLMIGIgBTxcKmvb8+di6yBhcwW9HzZhVwMxKFtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgN4IBBTAdBgNVHQ4EFgQUIWNhJisJVvrM3CwI4p4A1PJb8V8wDgYDVR0PAQH/BAQDAgbAMHsGA1UdIAEB/wRxMG8wbQYKKoMajJpEBQEBBzBfMC0GCCsGAQUFBwIBFiFodHRwOi8vd3d3LnNpZ25rb3JlYS5jb20vY3BzLmh0bWwwLgYIKwYBBQUHAgIwIh4gx3QAIMd4yZ3BHAAgwtzV2MapACDHeMmdwRzHhbLIsuQwaQYDVR0RBGIwYKBeBgkqgxqMmkQKAQGgUTBPDAprb3Njb203ODM0MEEwPwYKKoMajJpECgEBATAxMAsGCWCGSAFlAwQCAaAiBCBiU12AqJq84Lnm0FmI4eZgVzmLWOY9M8Dxher5R5Bu2jBWBgNVHR8ETzBNMEugSaBHhkVsZGFwOi8vMjExLjE3NS44MS4xMDI6Njg5L291PWRwMTFwMTIsb3U9QWNjcmVkaXRlZENBLG89U2lnbktvcmVhLGM9S1IwOgYIKwYBBQUHAQEELjAsMCoGCCsGAQUFBzABhh5odHRwOi8vMjExLjE3NS44MS4xMDEvb2NzcC5waHAwDQYJKoZIhvcNAQELBQADggEBAFUvilIrNBRhqQAAbG6aUca0uHQMjcCuLtHf/K0HjzihRul7W9UdrbTluN5oDPOM8KV37Jvy9yvgD22iQw0Wjv2+oBWHKWogw3rjgN/Y81l0GM70Y+05iShMpyae00d0p6pi3cY0YOjEYTxWxLNMr6VIB++N+4rG0fEjHVNuYuCiM+Tsoqy2J9m37VwJgAJ/kPDSLpCrWtVhri8ZYTNajlbb9lcw9u5u0g27CtXKILgRFRYVgSiJ11DvUn4Zp1CsG/Lf9XEFnefaurTKdRA8unN8kq5py05Cw9QloR2V5/JanhTfYvUwm/eLI7hMeIMD4ZmUsoY5JnVT3dTFeqwLA40=',
        key: 'MIIFPjBIBgkqhkiG9w0BBQ0wOzAbBgkqhkiG9w0BBQwwDgQImfL6k1fKfaQCAggAMBwGCCqDGoyaRAEEBBD0+Y40BXdtJ+Si/GpkOL8/BIIE8PwAtK72RrrC+9c0MqQNyqtCPv30Ywe1f/5CSxR+cHND2F0IZ/SUczXd3am/dJXE1PWw5R8wLg5cu3BvYR5RN/B3CxPf8ouDZs8z8Gv3/lOlOJsp9tgfOtcMIaEv4kNoWuInQPBdTqt8bBHt0hCcnF9wGDjeloy84hlwMBV+L4IodJWtojz+WY58m1DW3ndbp57D3IU/vZcwiyIas23GpBHtrxvklstHEb2nO0ZIAC+nx6vmiHUZ8V86ZmtBqvkcYFai3mbu81SuSdU8xqiMLxz9gVX8SyIwZXMoS02PP1Z2LnjRbIUE1NFPsMaocYC/SIDA8MwJjGVDoPP2EfrLHliQ0GzF6WaSEj7WtQgSQgF1TmT1fBxLg7YBAjdfr8s+66DrsNLqwK/fetpW2OybRbhgx1LNTZL6xawziDxxUgJ1/1Bl6TX4p0x5TDDt2NovyVcYo8kAFZXS8neZxG08whe03bElnMo/lU0X3Pyq561tOtfW6w+IksHJ8EnkfynApLAfGTFLBAiFXiqOeY7loshOQpokfmkiUxtyWYTXXLJb9JkxE96vGy1HDghSx/CecuYmd4sSUFrlTuT2Ch3cQtUJNkJ89YgBAQStw3pPA28oNMF/vKsjwQQFd9rnhcrcfJdTbh80SsNlghNCvz3lz2BgpzfQ/P9kNfsCWZVmMizF52SvvntRX04pM36RUFjcDcQm636APOIqvHRC/CIyYbfsE+jckuPue+uLBDmwpMcQmXacrf9EI2GkaMPzh1PajByQ9DLdi123UjQX7LlEi8Y2pAC5iRn+7aqQv7S7FLHJpkhZkFI5m9w6hs1zaPRhQz6B61dQivNfhuizXDbyklvFmexC+0/cYv+WMKQMBMiVij67iCAu13IXunutA3EdVoPkzRvdGLh6MSHeYlnKy/5nFvxYcgGZbYqO/0jcJIUYY88l2il05Uj0jxXSE49aiA/cYN6lcyvwQld6uBKJsgg1hLrBmwkWExioPErwz3mT6EJDMfboJXbon6cOBHbUn7HEW012cU7yiPHeRP933HsB9xtaDUlSgprqxXmtX70RnB9EGDuXAJ7SgqE6cXIwPz8xTelUa+kuoJuTdQ3+JV5TJ4OVIgxWZToEUVQPO+zIJdqw/rB1hJU2eEZvRavCLwm1ILKmHDsEaze7Lo5Ngtpekyg7sK/j+raImJv7QLTYfi/KXporpH4XRgCi6gLVtSIx2+M7JfSBIfbmIoePaCkIBBE5oLqYRtOlAQdb+kshvPCXIPKaiIeDnzloTqS2YZF6XGu4m5qjnE1xo31Zl8RAYO0+asGMSehp3oPS8BcQv3P1s2K9FuBTy6L16pS96SXfgkDz5/XztOwzOsR5SLux7BdUmhobQ0X0EaTwS8BqvX73ek2+DRK9v2yR/Kxg1enucW1PqKvscdfFpEoGV5CbTtUEZQ5etXQiJO0oo9MPlOd1svwZJAZ3c0gz2tThbmsF3U6oXdY+9Ut4ghKYUXdEBBp1XkhXcukXbxDIn/D80iXiIjmrs9WrRWhvjT2xiuIWrrgeVVMycBWQUYajxqko0hfs2jo1PGXLj0//gom5+D5tsnsNOJWm3wfOF71HNM5/NVzdGnarWDLt6KVSeZn5kuiU3QZzpRflwa5+QpIp0BhExGlYsL+EvpXsgYkcuFA6txZw8jext/Hr8UhPJAU=',
        kmcert: 'MIIE0jCCA7qgAwIBAgIDCFqkMA0GCSqGSIb3DQEBCwUAMFUxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkGA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E1MB4XDTIxMDUxMzA3MzkwMFoXDTIyMDUxMzE0NTk1OVowgYQxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExGDAWBgNVBAsMD+2FjOyKpO2KuOyXheyihTEYMBYGA1UECwwP7YWM7Iqk7Yq47ZqM7IKsMRgwFgYDVQQLDA/thYzsiqTtirjsp4DsoJAxEzARBgNVBAMMCmtvc2NvbTc4MzQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC8UGDHnDcrag84BcOK9VY4LMtwnihVwPPsOijrYzgrmVe5IpYiBAqh6fpn/4zeCMFTBhCsxVZhuGgvmhU/mHEoHS3t/bCLbgbmljq6jIJIo6aXvby/s/4wzcyeKx8sO/p94AhkNHaGnuD6LAG8izv/d198jgkRlaugi0K29qJQyZ45zuE9T2qLnNnRUgz/mv3tdEbH+Bi0VNYIBvtCXhdykVrLbmNVFG2rzZoHpOpeSLWI6us6OZ/NHSqSbx3PlXqkr0x2fcm0oE61HkO3xKooAjAobOEEeH0Rd9C5ZEeLakFGnI2FzkGzMXhvbR3eUgR1AlqngtufSxcc8qQV+W2xAgMBAAGjggF5MIIBdTCBkwYDVR0jBIGLMIGIgBTxcKmvb8+di6yBhcwW9HzZhVwMxKFtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgN4IBBTAdBgNVHQ4EFgQUVvbG17qdBSCpLjbQFYLrkzVqcvYwDgYDVR0PAQH/BAQDAgUgMBoGA1UdIAEB/wQQMA4wDAYKKoMajJpEBQEBDTBWBgNVHR8ETzBNMEugSaBHhkVsZGFwOi8vMjExLjE3NS44MS4xMDI6Njg5L291PWRwMTFwMTIsb3U9QWNjcmVkaXRlZENBLG89U2lnbktvcmVhLGM9S1IwOgYIKwYBBQUHAQEELjAsMCoGCCsGAQUFBzABhh5odHRwOi8vMjExLjE3NS44MS4xMDEvb2NzcC5waHAwDQYJKoZIhvcNAQELBQADggEBAKcAq2+rfVTbE4yRhYAsdVK2Bop+m2RXrP1zlvTy8jpKnauPrPfB3+oibllIeWgYEqB9r98/bwbQTcAt/uNnRyMB/HrJ2hN/S/5CPDOIgzxy+yBIcWNUmC1LCsbTab7zTPr/19UVFJ8UePS5QIYwT8kkujPTiyq5THm9R1UFLlM4qZT5N9cOan9rXtYcQmszrSJohwxhK1JagnMYEKnsugDqIf0hVJH9XjwszAnvWhN++g/QWP52+pvw9cLttJhjPnu7HmQntRwhWz6nBBKGG7KprNg3QmXx16NDPfmRsG0TNttib/o45ZS41pIsVG7pe9wDV8OnWLIgw7v4FoNY0Cg=',
        kmkey: 'MIIFHjBIBgkqhkiG9w0BBQ0wOzAbBgkqhkiG9w0BBQwwDgQI6kY9qFGoFEQCAggAMBwGCCqDGoyaRAEEBBA+IrCzZwB+GcT3/+ZvYmn/BIIE0MRNnb5/yq4vn47tmAka2nUiWIk5sOWRfuJ89jGiIvKIhUbm6yorgO+JpNa66Y/AqhU26W3+AZdf8maUVOjdbN1bgyUoAJhccW+QqpKLaBFLiohqfuClHX2AbrNXx7989kXTFKaqOJrCy8AAqFyaA8waSzQajBLGRPfCVEUalAsExk6Gnw/YZF8VM5efPoB+E/G1LC/CGdSTZReiZMMZv+13RLuimyBvteGLGFKxkCEWkNojq9Gb4g/fx44xzPFeOM5dgBeyDc+8QzEtR6sOWObb8bmv6bh8/ep06xjNkwzivWOXel3pdpxwIuIVCO1bW8woic04l+D2XXzga1ukqQTcUUbltZKb+oSlDcLd5bdXDp1nz+Lt1JlL7vt0fQJFjCDIu66AJXovZJ0oIM7jLUe4Y52LnqPAwbc9/a6/8TG25yTqCD4QucrfnEQByK2syjxDZAb+0gDpjoxzoLKPvf0Sbd0u9flpP3ci6aKyfCd/NjpKrthbRxrfGfFd/zUKcNMx5jaIzKbInsfWJvNZmajs/LrU8kZSArHPqOFNoG1zur7YrzqQfFzGXEmj7pAS3uItdxFqY6Uo0eKTSoRJMkovtFE5j1xbWwgOZvtmTjdXSo7+XH6eZY6V0zNbLB+WsvRCGuZBk0PitxyhLQcTqsMzi4yXxOKUQyUlVwKWu5luf4D7JT1JaUn/PFOqdfJJaLeCFB/UaQAlvdwyFPQJd5i0pfc1ReQuBgrtFB4QXjWDk5J+iqoMKSLFplBjsvkqSO4G4J6GnHw53kmMcoeLaXeVRvByfrbGHYgdOG+jIRY3QvFxgblfR3qS+CavMVJYVDu8cclkEzdaWGjeyiStYWKnlBLB/BW0aTuICu2hQyJaQeC64RlkZA/vR1oCFyLFR5tMLc4f+tItLnT4XYSKtrUAtAQUlt47QAN7E7IEGP6TLTLSD5Bn4FDs+UIOghjfuwv/2Jwpb4dOcnmofZwvwS3FoQu9r2KC2Ditg3wHSxY5PhVOTT3Zdcy6zRbf83B9KwHosMnoZwz7WbrVbwjCv/nXcqIr1O5at27/U/WloIsAtRYvR9rYMv+Jzgn1URqTpT281/BA8UG83UI/fCKYYhawo99vTWQKCMwfYGRI9q4mHelB6+icoSXDqEpRLHTiULnJw4n4FClCIhv2UoX+Mn15a3qhonv6TdXKPI+NkRwwZ55YYIKHcqD7Fpvp6lmZqS8opuD79PQ+i2Y+Dh6XJEy7OvLwn7PZp18g/w40H/2gQDWHbylMoSFXrqcYEhD1A/gkCnk65bLg9Kj0OiJGw3FEGnxezWz5r6oJ7L62LFTrHq7KYac3O8Rf5IJCdlMUtFj3L1S5AlHxoKJDFZ/+NkXrNJ15laKDrwQplXNFvghLjAgR1bb3K8eZ/lvPRJUI+zvGI1iIRkNu70OxoL2slH0ozV3Cj5YL0ClTxzck8YD2UpghUViXenPkxZlCZZDaCsftJ4Df0uBsovLNNpPrTLS5VaamKvuCRkveeJFUVWY0mGagcktyzwRuIMb0iLz4XH6bMrZXxcWPyUyu8//yPEUpGBzgWjgYh36fvkbXA50UBa/iYJ6j1QEDe5y9Tf8Yev3fWpGZQ1xNeMha5i6XgPboyN4n5xdh82LK6h0Sb/sh'
      });
      certObjList.push( yt.pki.Certificate.fromBytes( ytcrypto.util.decode64(certByteList[1].cert) ) );
      // #3
      certByteList.push({
        cert: 'MIIFojCCBIqgAwIBAgIDCkzzMA0GCSqGSIb3DQEBCwUAMFUxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkGA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E1MB4XDTIxMTIwMjA2MzQyN1oXDTIzMTIwMjE0NTk1OVowgYYxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExGDAWBgNVBAsMD+2FjOyKpO2KuOyXheyihTEYMBYGA1UECwwP7YWM7Iqk7Yq47ZqM7IKsMRgwFgYDVQQLDA/thYzsiqTtirjsp4DsoJAxFTATBgNVBAMMDGphenpob25nMTI1NjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALWGOhXJowRPJKiKHM1aBTVV+BR9VqD9y/x56O1kI1NxDVdyOgW7Q5b5DQsIYC0uFsvE2vfJLCkLStB9wngNi7OzQnYLpanQw1Jut247AObajPoYAvEtQuoVjWM0SyW1FMaDNd/CpEq5+9v10s8jOQVAmfw4qa4WfCKMpe2DLcc+WTWN3NkYiZfVqUQLddnLqjsz9KiPS0uTB3WMcJ6MI4a6hsdi0M+Flv9jp04inSvh6qJLjMo/tEauLAl3H6zWKnuolnsg5QjkAqpE6xBn8HiQESQ1h3VczuC//Sh+ALr10KOMYRJwPjo6gOB9USFJbnF6VqjSOj13L2EB+pYar90CAwEAAaOCAkcwggJDMIGTBgNVHSMEgYswgYiAFPFwqa9vz52LrIGFzBb0fNmFXAzEoW2kazBpMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3ggEFMB0GA1UdDgQWBBRWwrfCcWHr7G3wKziyXJg0hNUfejAOBgNVHQ8BAf8EBAMCBsAwewYDVR0gAQH/BHEwbzBtBgoqgxqMmkQFAQEFMF8wLQYIKwYBBQUHAgEWIWh0dHA6Ly93d3cuc2lnbmtvcmVhLmNvbS9jcHMuaHRtbDAuBggrBgEFBQcCAjAiHiDHdAAgx3jJncEcACDC3NXYxqkAIMd4yZ3BHMeFssiy5DBrBgNVHREEZDBioGAGCSqDGoyaRAoBAaBTMFEMDGphenpob25nMTI1NjBBMD8GCiqDGoyaRAoBAQEwMTALBglghkgBZQMEAgGgIgQgTZKz5Wq9W7agU8DmBWehubJxSlWLnKtFkmk87Nju3GIwVgYDVR0fBE8wTTBLoEmgR4ZFbGRhcDovLzIxMS4xNzUuODEuMTAyOjY4OS9vdT1kcDExcDU1LG91PUFjY3JlZGl0ZWRDQSxvPVNpZ25Lb3JlYSxjPUtSMDoGCCsGAQUFBwEBBC4wLDAqBggrBgEFBQcwAYYeaHR0cDovLzIxMS4xNzUuODEuMTAxL29jc3AucGhwMA0GCSqGSIb3DQEBCwUAA4IBAQB7uNZb34u09XG81lQw9SgnWdaGeBV7B6kUWPQABLGA195NEu6N9QzcjwwpIm+SDbbMOL0NPO/YL1YKvTVTZnnL++HxjKlN9DGwcPwImV5VlXNm7GhyqKcMAtHNcpzeOzsbxdVv9kr0iGz1BzHRit5wNbl4AdwtZnI0hSO2vE37xzF1SI4BKry6pHeQRZEM2lXLkldu2NyzjmIpMWI+YAFqa9sfE9KH/BCQS09khLSAjjFK3YMnkU1he9KrL7mj2xWEv/VQsh9lOy3HqdLZxaKZjBJWIC11o8CBr+0s9zADNVSUx79e8mU52msa8oQtFvXUuKP5Z9jOW9DKE7rD1t8S',
        key: 'MIIFPjBIBgkqhkiG9w0BBQ0wOzAbBgkqhkiG9w0BBQwwDgQIq/vjVoL1xjUCAggAMBwGCCqDGoyaRAEEBBDJgEw6DDC7e2rV2pBNP8jMBIIE8CTstGjmedixvtmHxaQljAuBONlcUnn+1BM3V4jHH1Lll7qIhqcU24H6ymSYBl+9OT+6M+S4j69s/LFsPenwCqUSVHKr0nzBsrZKGaBrV9RUMd9qavUUM5nzDyDO5oqWUGf6RtChDgDmKG2mXe09QqrV1qiKykanOcXLbBO9sSmx+oQfzSg53jgEHZ3BKNURb3WVA02u1ny0+j4IxRe/3AeL5vAXxjWn7xLnRY6VK3E/5vDL2kOg9wxpUewXxEyXfUU8V2t/i7134Dizi7FWPGib17gOJYd7NDbtRpmAN5ZLzVmFEX/CoDHujZgbCYJ8AArcKqdpDSvJo2id75/+NAi3CO5xSqSnarLlztjaaAfE7heVZ9G4tbZvK2l+k3T3/yzyf+FIGTsJWeZkpydURnlUIY/7iWQ8RrNTUpAd8nq2n5c9IC2eHZI09Pfw+kOrr6S3fc2wuEIxLRx/gMW+QMWeHn6C9c8JWFxanu6XVHQXCpJpb5GZ5mjjHgFm+LWdKt7RTC1J5TM8WaPAzr+EAPvy2QUYSHPu/B3mA9lgJJAHvzWBoZuE9Nwo8CrwMa4/487m8WNnzdFkPbyUhaIc8u3vvSKj5y7Ns8FMvmrKepIS60zBNFgO3/sRzEr33ZIa0Vqf5/g2HyKtR2HAffWVRlaBVwdVnLXqlUHR9VF3m6Q7L2mdnHG3OcGYP+e0Z5zPFCM1sFITBgokigNXqz24ny9i5i36IPBu0afmZrqOYmIh8Njfx9719gQyb0vEylcDFRojykdC/w82864ZIkqDE9+dnymHlwsi/BXnri3/vM1kvnxFAghNU4nlT7sguKZNE9OoQ5ojD3Wn4Srii0Kn/lXmZBQIxmkAZS4jExnOhsksELYMVdNmbYuQaAgeweC+x2WCsUXpstvzf4o5yO48syk9AcCQdw7SQmCa5erK0jbusHlcSA3KRFqri+7/p9pqO9GNh8/j5xmKFFv289jZUQdzRaU0rlr5jav/bm9Uc84d1e1HPC9+P9yIDfu5T/cdQFTr/ciY0zHTL2Hzjbs60ZSV0a/OWN7xCTQ/P8Mlu4h3bm5UyIVHwBdKpbsij8vnsNpjw6eqpAiUndInKb1r8WEXGhqDPDVtk3pzsfEoXiTVKtW2wOJ3/Noxb+CfebJIDTeF/TKVAu4k8cNI29JpimHzDhuYs+UQE2io9zhpM944yh4oo6jyIpxT6zHW3hq4JxfL68xxNJAPvjNnXXouLSzCGM6ZRyubGilfb15J3qhWeZcYN4P45G1WgqOP9IQHcdmIBUDiyjAvS3etdQViGL3gNDUk7fJzhzamKHUfvEpqtrbrYmiJW6nc5pzw5DHzivO4msUiacSkTgMLxqf6EApkfIEPgIlxOqo00DFBYfjjvf5ejfX627+48m6APvYLw5BN2UN6q/5K53W/Q6Ix43Xi/mW5Kq8aIUwKuIRQ8pyeC2pWmbn4K5O0hxyskMLwoK1K1t+89v0kv4RU+qf/fk2vxE7fCWH8wGiIDSlvbIIeaJm/jSlqAoypoSRx+8OovM80jgWGHXtSYHHjHc93n1vB5lYIElI2XdTaltClOyrlTTLw1M4Fomh398z4JQad+CXg+Yzd3CTiWrvw3l+3mIxAtXxGkEMTWmfBFRUhq7yS2VnQmUSCV3Bp+uDBQwg9WmMQ/8jj3MKmBDpcQJ4/ViA=',
        kmcert: '',
        kmkey: ''
      });
      certObjList.push( yt.pki.Certificate.fromBytes( ytcrypto.util.decode64(certByteList[2].cert) ) );
      // #4
      certByteList.push({
        cert: 'MIIFojCCBIqgAwIBAgIDCkzyMA0GCSqGSIb3DQEBCwUAMFUxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkGA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E1MB4XDTIxMTIwMjA2MzMwMFoXDTIyMTIwMjE0NTk1OVowgYYxCzAJBgNVBAYTAktSMRIwEAYDVQQKDAlTaWduS29yZWExGDAWBgNVBAsMD+2FjOyKpO2KuOyXheyihTEYMBYGA1UECwwP7YWM7Iqk7Yq47ZqM7IKsMRgwFgYDVQQLDA/thYzsiqTtirjsp4DsoJAxFTATBgNVBAMMDGphenpob25nMTI1NjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANnhnEbFnbFjv8qRUh7et5oNlvIKIItP8qjLgNCdeAyWk/lmilbK2mQ9vNGScKQgYpezoFYn3JYUaVdmPXWaeUp4StrQhSSHGupLSCJ75+986oumxV15x2AdK4xmUVCwyw7rzVB+tFFTl6Yl81lPhDDmqe4UleSqoltXy/sMrKeKNe7B7VkyGR1fmK0Bf/JpCb1HEXPNmc0EDhfRzbp2lltUFvCyLtq35hWZMhd0wb2meUklwKMFsnvG3OGU8gYVYM0RKg9CIGdAG+L4KZZw6ZTERhJdVFFqGbM3aSqsS0y119ArcpD1BiO7sGhyvVazLpBOVq0BfuDEKqaVzyFNtiECAwEAAaOCAkcwggJDMIGTBgNVHSMEgYswgYiAFPFwqa9vz52LrIGFzBb0fNmFXAzEoW2kazBpMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3ggEFMB0GA1UdDgQWBBRrEgHleW1Oh8B1PMlKd5SnLSEp/zAOBgNVHQ8BAf8EBAMCBsAwewYDVR0gAQH/BHEwbzBtBgoqgxqMmkQFAQEFMF8wLQYIKwYBBQUHAgEWIWh0dHA6Ly93d3cuc2lnbmtvcmVhLmNvbS9jcHMuaHRtbDAuBggrBgEFBQcCAjAiHiDHdAAgx3jJncEcACDC3NXYxqkAIMd4yZ3BHMeFssiy5DBrBgNVHREEZDBioGAGCSqDGoyaRAoBAaBTMFEMDGphenpob25nMTI1NjBBMD8GCiqDGoyaRAoBAQEwMTALBglghkgBZQMEAgGgIgQgtiZvwEafWAa1TZnoIDK6o1h17bAUHjTPkk1HGSh2uk0wVgYDVR0fBE8wTTBLoEmgR4ZFbGRhcDovLzIxMS4xNzUuODEuMTAyOjY4OS9vdT1kcDExcDU1LG91PUFjY3JlZGl0ZWRDQSxvPVNpZ25Lb3JlYSxjPUtSMDoGCCsGAQUFBwEBBC4wLDAqBggrBgEFBQcwAYYeaHR0cDovLzIxMS4xNzUuODEuMTAxL29jc3AucGhwMA0GCSqGSIb3DQEBCwUAA4IBAQBYepFx2bAWdJIwQxhjfRqqn/qtIHHRiOPDf4suHYNMywXS5BRQekwpaA3Opithl+7az9ZBzHFDUGKOkeQZI4xiC6gZJhPsecnXjeVtWs1Y1I3IXhwbOckDe8/SqetJit11x1oRowUEVxOyi2OInRqQVwODLrn61QgFo3570jBmqq9f31SiYZYqBZNfUAyB0Prg0lUE1hTPvhf6DW5FmxB07ENta1JtLrGqNjyZ8yYVlUoG1aJZv3eE97g/x6PG3KADNs42jNejTenw186bToZYmSOKnDS9JV7S4tRQHkTatyObMb+GENxa1vkXuGQQ9f8s4uF/u92sVJS1f8pgOZRV',
        key: 'MIIFPjBIBgkqhkiG9w0BBQ0wOzAbBgkqhkiG9w0BBQwwDgQI05qyGcAFe4gCAggAMBwGCCqDGoyaRAEEBBBPhFvA2Ovb64kSGn/I6p4fBIIE8HDhDJ9W8AXYxFN6cmJNKe87CveX0Twh9NF+8k92pdUclNO6ZKx+DdEpgR6IX3RhOi0HZFJ8NANMgVu6Jaj/0clVcboBkLvZQzOQyAhVjoLlOPMlX/1uFtXZ+DEyb5Ibm9hdlK7EoubgS+0ZWOmYBR746IcLlPEFcWAGXs3MMMBM0Euzy9Y1DN69W6XNmrOtertxr0HXGekasrRxhXzFi/boNHtkoRzwf+Nla/vP3Gfo4XpVG67tRclHxdzMxnYfuJBAc8d1Lbcby+uWwXMa9Tn8nqQ37NJ5yY/QcKKPEzNU083eJcHOf4CgYSC6ITKbIoxVn+upLvEpoTC5HNX5CebW9grneCO1flzrTQ828dB4C3RpYLdIcSNtU9TD9LbQ6OsIU90/KM+2Hexkq8aFpj3LvQo113uF5x9nm6BOmcB1eJOdgon1h92NQFX2L4XiLVdmdhrNZNZ5vf3Mh4sMEmyQMir0YJKa3oRu6ye54wP515laYVtvLyVD4Q/7bZPt0r85RTYLLaBagxNYBjfs0et4j69N5UOPukXuR7i2bQioiZWpJtmyvUEl9Lvo63HtC/l3tHrVTM90LQp6qY5N37i415U3uNaPP7daxnV8q/XZOg6JDykxGNffctJOXY9Q+3cn+/VQJkWYyEFAs/46uTP8HJ/pGsQGfTalewfJL1WyEf65VEWG1zIsHYq6m1c5eWFtx/JH0Pt7hKYnq+Y71WGrqi2hfW8S07B29ONAdvBV/BEKejCWSHwWVUToFuKmfhW7n52EsCEE7EwlypWIls9Ttk7YLvYWYrvtyWuOAvfqE7MIiqy5EagVkd5KwAAaeOcIjngoDvL7KlSEe/k0dt+tKJf1QGS85zTfwe2Kj+FmE3RNCqgTPAWVqjJvFj+veySJihcUyDXEaCWZRHacQ7Qv+JlsB7UR9kRqJXouQy+xYxRjxrew19Fc0zGjbU6AIZrEKPUPfpULYcucHxBqMA0wDRulrc1zOCkc4Uie0vQ9rercSakUhN2CYPjOiPSnJVlieD84lu5cZejw2blAjmSMyE2n4rYktpV0egn0/q3LJoQqGl7Mi/QyscOxm2ICdEiS+0vs/HxJuV5HB2yUfJkAgSG1TNNVtY6faXJqYaozVvMeumjCPOZ6yGiMB9kZ1UP4TZFZx+yXlAdaVTQSJlEuJEDA6wfCAaK/WEg3wlTA3tRJ+NDzIxOhv4O3PC7061MQqzXPAxI9vKAECMAurAp85SuP7nr4pqbn2AgaVVGUTyqhs1rTQuyUQb3cQEQuuJr3iX2v31MgrOH4QLXTH+IbQt2cZaNYbuy818eNsP8nL8+3entBhJZwteFWTrZpjZCBnTD/7Mhno7p0TJUl39dYzhHYmWGTbmitsa/5qMJFx0F3gPrVrhtByrJruSStmqUtss37BfrNpr1VQSJsjSt0I56QqDD10aa2Tx5g72k96dRJBXvuV9xa+IScVUoHHY6DRNMSayoHCKN9/xGD8tglkANoyWeAdRfRli70YGY7+nD5aaFa9GMHV9GklhFm2vvDE3oXiJwg367c9FD+KwDW0bSmQz0yynb849fKK3MyijKpOQG+dXNfOe/leJ0vJN+xZ0HTlRZXpTr+WZhnq5YLvxJUk6VWtCPvNLJ/oz7ZL23RYX8V81GaPejOEnuH6eQaFcinq9BElNRJgCnTDPc=',
        kmcert: '',
        kmkey: ''
      });
      certObjList.push( yt.pki.Certificate.fromBytes( ytcrypto.util.decode64(certByteList[2].cert) ) );
      //
      var doc = document.createElement('fieldset');
      doc.setAttribute('id', 'ui_cert_reg');
      doc.setAttribute('class', 'ui conn certreg');

      var html = '';
      html += '<h2>인증서 선택</h2>';
      certObjList.forEach(function(item, index) {
        html += '<div class=input-container><input type=radio name=radioGroup_sc cert='+JSON.stringify(certByteList[index])+' />';
        html += '<div class="certInfo sample">'+item.subject+'</div></div>';
      });
      html += '<br /><input type=button value=확인 id=btn_pin_cert />';
      doc.innerHTML = html;
      document.body.appendChild(doc);
      
      var ele = document.getElementsByClassName('sample');
      for (var iter=0; iter<ele.length; iter++) {
        ele[iter].addEventListener('click', function (evt) {
          evt.target.previousSibling.click();
        });
      }

      id_coll('btn_pin_cert').addEventListener('click', function () {
        let ele = document.querySelector('input[name="radioGroup_sc"]:checked');
        if (ele == null) {
          alert('인증서를 선택하세요');
          return;
        }

        var certificate = JSON.parse(ele.getAttribute('cert'));
        id_coll('ui_cert_reg').parentElement.removeChild(id_coll('ui_cert_reg'));
        callback(certificate.cert, certificate.key, certificate.kmcert, certificate.kmkey);
      });
    }

    function UI_CERT_PWD(callback, errorcallback) {
      var callback = callback;
      var errorcallback = errorcallback;

      var doc = document.createElement('fieldset');
      doc.setAttribute('id', 'ui_pwd');
      doc.setAttribute('class', 'ui conn pin');

      var html = '';
      html += '<h2>인증서 비밀번호 입력</h2>';
      html += '<div class=input-container><div>비밀번호</div><div><input type=password id=pwd1 placeholder=12qwaszx23! value=12qwaszx23! /></div></div>';
      html += '<br /><input type=button value=확인 id=btn_pwd />';
      doc.innerHTML = html;
      document.body.appendChild(doc);

      id_coll('btn_pwd').addEventListener('click', function () {
        var pwd1 = id_coll('pwd1').value;
        
        id_coll('ui_pwd').parentElement.removeChild(id_coll('ui_pwd'));
        callback(pwd1);
      });
    }
  function UI_PIN(title, callback, errorcallback) {
    var callback = callback;
    var errorcallback = errorcallback;
    

    var doc = document.createElement('fieldset');
    doc.setAttribute('id', 'ui_pin');
    doc.setAttribute('class', 'ui conn pin');

    var html = '';
    html += '<h2>' + title + '</h2>';
    html += '<div class=input-container><div>PIN 번호</div><div><input type=password id=pin1 placeholder="PIN 번호를 입력하세요" value=001122 /></div></div>';
    html += '<br /><input type=button value=확인 id=btn_pin name=btn_pin />';
    doc.innerHTML = html;
    document.body.appendChild(doc);

    id_coll('btn_pin').addEventListener('click', function () {
      var pin1 = id_coll('pin1').value;
      
      id_coll('ui_pin').parentElement.removeChild(id_coll('ui_pin'));
      callback(pin1);
    });
  }
  function UI_PIN_CHANGE(callback, errorcallback) {
    var callback = callback;
    var errorcallback = errorcallback;

    var doc = document.createElement('fieldset');
    doc.setAttribute('id', 'ui_pin_change');
    doc.setAttribute('class', 'ui conn pinchange');

    var html = '';
    html += '<h2>인증서 PIN 변경</h2>';
    html += '<div class=input-container><div>기존 PIN 번호</div><div><input type=password id=pin1 placeholder="기존 PIN 번호를 입력하세요" value=001122 /></div></div>';
    html += '<div class=input-container><div>신규 PIN 번호</div><div><input type=password id=pin2 placeholder="신규 PIN 번호를 입력하세요" value=221100 /></div></div>';
    html += '<br /><input type=button value=확인 id=btn_pin_change />';
    doc.innerHTML = html;
    document.body.appendChild(doc);

    id_coll('btn_pin_change').addEventListener('click', function () {
      var pin1 = id_coll('pin1').value;
      var pin2 = id_coll('pin2').value;
      if (pin1 == pin2) {
        alert('기존 PIN 번호와 일치합니다.');
        return;
      }
      
      id_coll('ui_pin_change').parentElement.removeChild(id_coll('ui_pin_change'));
      callback(pin1, pin2);
    });
  }
  
	function id_coll(id){
	  return document.getElementById(id);	
	}
	
	function cancle_click(id){
		id_coll(id.id).parentElement.removeChild(id_coll(id.id));
		return;
	}
	
    var SecureData = function() {
      this.key = ML4WebApi.webConfig.cloud_securedata_key;
    };

    SecureData.prototype.setData = function(input) {
      return Encrypt(input, this.key, 128);
    }

    SecureData.prototype.getData = function(input) {
      return Decrypt(input, this.key, 128);
    }
    
    window.SecureData = SecureData;
    /*************************************************/
    var config = {
      serverHost: ML4WebApi.webConfig.cloud_server_host,
      serverPort: ML4WebApi.webConfig.cloud_server_port,
      moPollingTime: 1 * 1000,
      moRepeatDelayInterval: 1 * 30000,
      cacheMaxCount : 5,
      clauseURL: ML4WebApi.webConfig.cloud_clauseurl
    };

    var secureData = new window.SecureData();
    var cloudWeb = new CloudNPKI.web(config, secureData);
    /* ui 초기화 함수 */
    cloudWeb.init(UI_JOIN, UI_MO, UI_CONN);
    /* license 설정 초기화 함수 */
	cloudWeb.initLicense(
      ML4WebApi.webConfig.cloud_site_code, ML4WebApi.webConfig.cloud_app_id, ML4WebApi.webConfig.cloud_customer_id,ML4WebApi.webConfig.cloud_api_key
    );
    /* 연결요청시 추가 필드 */
    cloudWeb.setExtraConnectionInfo('custom data');
    /* 커스텀 처리를 위한 콜백API (동일 이름 처리 등) */
    cloudWeb.addUIEventListener(function(options, callback, errorcallback) {
		debugger;
      switch (options['code']) {
        case 20010:
          if (confirm('다른 이름으로 가입된 정보가 있습니다.\n재가입 하시겠습니까?\n저장된 인증서는 모두 삭제됩니다.')) {
            callback();
            break;
          }
        case 20013:
          if (confirm('이미 연결된 사용자 정보가 있습니다.\n삭제 후 진행 하시겠습니까?')) {
            callback();
            break;
          }
        default:
          errorcallback();
      }
    });
    cloudWeb.setStorageEventListener();
    
var Storage_API_new_cloud = {
	selectCertString:'',
	selectCertIdx:'',
	res_true:0, //일단 안씀
	certBag:'',
	certpass:'',
	certpin:'',
	
	getSelectCert : function( storageRawCertIdx ){		
		ML4WebLog.log("Storage_API_new_cloud.getSelectCert() called...");		
		var cert =  { code : 0, signcert : "",  signpri : "", message: ""};
		try{
			if(Storage_API_new_cloud.selectCertString.length!=0 && Storage_API_new_cloud.selectCertString.storageCertIdx == storageRawCertIdx.storageCertIdx){
				cert.signcert = Storage_API_new_cloud.selectCertString.signcert
				cert.signpri = Storage_API_new_cloud.selectCertString.signpri
			}else{
				var certBaglist = Storage_API_new_cloud.getML4WebCert();
				var isExit = false;
				if( certBaglist != null ){
					var certBaglistObj = JSON.parse(certBaglist);
					var selectCertBag ={};
					var certBaglistObjCnt = certBaglistObj.length;
					
					for(var i=0; i<certBaglistObjCnt; i++){
						if( certBaglistObj[i].storageCertIdx == storageRawCertIdx.storageCertIdx ){
							selectCertBag =  certBaglistObj[i];
							isExit = true;
						}
					}
					if(isExit){
						cert.signcert = selectCertBag.signcert;
						cert.signpri = selectCertBag.signpri;
					}else{
						if(typeof( storageRawCertIdx.browserSaveYn ) != 'undefined'){
							cert.signcert = storageRawCertIdx.signcert
							cert.signpri = storageRawCertIdx.signpri
						}else if( storageRawCertIdx.browserSaveYn === true ){
							
						}
					}
				}else{
					cert.signcert = storageRawCertIdx.signcert
					cert.signpri = storageRawCertIdx.signpri;
				}
			}
			return cert;
		}catch( e ){
			cert.code = ML4WebLog.getErrCode("Storage_Web_getSelectCert");
			cert.message = "certBaglist error message : "+ e.message;
			return cert;
		}
	},
	getML4WebCert : function(storageRawCertIdx) {
		var ML4WebCertObj = {};
		var certBaglist   = "[]";
		var crypto_api    = ML4WebApi.getCryptoApi();
		var certID = storageRawCertIdx.cert_id;
		var pass_pin = storageRawCertIdx.pin_pass;
	    var PIN1 = secureData.setData(pass_pin);
        cloudWeb.getCertificate([certID], PIN1).then(function (res) {
         
		  var temp = new Object();
          temp.cert = res[0]['cert'];
          temp.key = atob(secureData.getData(res[0]['key']));
          if (typeof res[0]['kmcert'] !== 'undefined') temp.kmcert = res[0]['kmcert'];          
          if (typeof res[0]['kmkey'] !== 'undefined') atob(temp.kmkey = secureData.getData( res[0]['kmkey'] ));
          temp.last_update_date = res[0]['last_update_date'];
          if (typeof res[0]['secret'] !== 'undefined') temp.secret = atob(secureData.getData(res[0]['secret']));
          temp.ver = "v1";
          
			if (typeof(res[0]) != "undefined" ){
				var certlist = temp;
				
				if (certlist != null && typeof(certlist) != "undefined" && typeof(certlist) == "string") {
					certlist = crypto_api.getDecryptedCert(certlist);
					certlist = JSON.parse(certlist);
				}
				
				if (certlist != null && typeof(certlist) != "undefined" && typeof(certlist) == "object") {							
					if (typeof(certlist.ver) != "undefined" && certlist.ver == "v1") {
						certBaglist = JSON.stringify(certlist);
					}				
				} 
			}
		
			return {"cert_list": certBaglist};
        }).catch(Storage_API_new_cloud.WebErrorException);
	},
	setML4WebCert : function(certlist) {
		var ML4WebCertObj = {};
		var cipher_cert = [];
		var crypto_api = ML4WebApi.getCryptoApi();
		
		ML4WebCertObj.ver  		  = "v1";
		ML4WebCertObj.time		  = new Date().getTime();
		ML4WebCertObj.certBaglist = cipher_cert;
		
		if (certlist != null && typeof(certlist) != "undefined" && typeof(certlist) == "string") {
			ML4WebCertObj.certBaglist = certlist;
			cipher_cert = crypto_api.getEncryptedCert(JSON.stringify(ML4WebCertObj));
		}
		
		if (typeof(localStorage) != "undefined" ){
			localStorage.setItem('new_cloud', cipher_cert);
		}
	},
	delML4WebCert : function() {
		if (typeof(localStorage) != "undefined" ){
			localStorage.removeItem('new_cloud');
		} 		
	},
	DeleteCert : function(storageRawCertIdx, callback){		
		ML4WebLog.log("Storage_API_new_cloud.DeleteCert() called...");
		
		try{
			var certBaglist		= Storage_API_new_cloud.getML4WebCert();
			var certBaglistObj	= certBaglist!=null ? JSON.parse(certBaglist) : [];					
			var selectCertBag	= {};
			var crypto_api		= ML4WebApi.getCryptoApi();
			var certInfo		= false;			
			var cert_list		= [];
			var certBaglistObjCnt = certBaglistObj.length;
			
			for(var i=certBaglistObjCnt-1; i>=0; i--){				
				if( certBaglistObj[i].storageCertIdx==storageRawCertIdx.storageCertIdx ){
					certBaglistObj.splice(i, 1);
				}else{
					var cert_length = cert_list.length;
					cert_list[cert_length] = certBaglistObj[i];
				}
			}
			
			Storage_API_new_cloud.delML4WebCert();
			
			if(cert_list.length>0){
				Storage_API_new_cloud.setML4WebCert(JSON.stringify(cert_list));
			}else{
				Storage_API_new_cloud.setML4WebCert('[]');
			}
			
			callback(0, {"result":true});
		}catch(e){
			callback( ML4WebLog.getErrCode("Storage_Web_DeleteCert"), {"errCode": 888, "errMsg": e.message} );
		}
	},
	GetDetailCert : function(storageRawCertIdx, fields, callback){
		//ML4WebLog.log("Storage_API_new_cloud.GetDetailCert() called... fields.length = " + fields.length);
		ML4WebLog.log("Storage_API_new_cloud.GetDetailCert() called...");
		var val = ""; //a value according to fields

		//TODO Delete dummy data
		var crypto_api = ML4WebApi.getCryptoApi();

		try{
			Storage_API_new_cloud.GetCertString(storageRawCertIdx, function(code, message){
				if(code==0){
					var certbag = message.cert;

					crypto_api.getcertInfo(certbag.signcert, fields, function(code2, message){
						if(code2==0){
							var result = {};
							var fieldsCnt = fields.length;
							
							for(i=0;i<fieldsCnt;i++){
								var field = fields[i];
								result[field] = message.result[field];
							}

							callback(0, {"result":result});
						}else{
							callback( ML4WebLog.getErrCode("Storage_API_new_cloud_GetDetailCert"), {"errCode": code2, "errMsg": message});
						}
					});
				}else{
					callback( ML4WebLog.getErrCode("Storage_API_new_cloud_GetDetailCert"), {"errCode": code, "errMsg": message});
				}
			});
		}catch(e){
			callback( ML4WebLog.getErrCode("Storage_API_new_cloud_GetDetailCert"), {"errCode": 888, "errMsg": e.message});
		}
	},
	GetCertString : function(storageRawCertIdx, callback){
		ML4WebLog.log("Storage_API_new_cloud.GetCertString() called...");
		//var certBaglist = Storage_API_new_cloud.getML4WebCert(storageRawCertIdx);
		var certID = storageRawCertIdx.cert_id;
		var pass_pin = storageRawCertIdx.pin_pass;
	    var PIN1 = secureData.setData(pass_pin);
        cloudWeb.getCertificate([certID], PIN1).then(function (res) {
          //console.log('getCertificate result=', res);
          //debugger;
          
		  var temp = new Object();
          temp.signcert = res[0]['cert'];
          temp.signpri = magicjs.base64.encode(atob(secureData.getData(res[0]['key'])));
          if (typeof res[0]['kmcert'] !== 'undefined') temp.kmcert = res[0]['kmcert'];          
          if (typeof res[0]['kmkey'] !== 'undefined') atob(temp.kmpri = secureData.getData( res[0]['kmkey'] ));
          temp.last_update_date = res[0]['last_update_date'];
          if (typeof res[0]['secret'] !== 'undefined') temp.secret = atob(secureData.getData(res[0]['secret']));
          temp.ver = "v1";
          
          //return JSON.stringify( getCertificateResult );
          //debugger;
			if (typeof(res[0]) != "undefined" ){
				var certlist = temp;
				
				if (certlist != null && typeof(certlist) != "undefined" && typeof(certlist) == "string") {
					certlist = crypto_api.getDecryptedCert(certlist);
					certlist = JSON.parse(certlist);
				}
				
				if (certlist != null && typeof(certlist) != "undefined" && typeof(certlist) == "object") {							
					if (typeof(certlist.ver) != "undefined" && certlist.ver == "v1") {
						certBaglist = JSON.stringify(certlist);
					}				
				} 
			}	

			if(typeof(certBaglist)==null || certBaglist==null ){
				callback( ML4WebLog.getErrCode("Storage_Web_GetCertString"), {"errCode": 201, "errMsg": $.i18n.prop("ER201")});
			}else{
				ML4WebLog.log("Storage_API_new_cloud.GetCertString certbag Text ="+certBaglist);
				var certBaglistObj = JSON.parse(certBaglist);
				ML4WebLog.log("Storage_API_new_cloud.GetCertString localStorageNum ="+certBaglistObj.length);
				ML4WebLog.log("Storage_API_new_cloud.GetCertString parameter ="+storageRawCertIdx.storageCertIdx+" "+certBaglistObj.storageCertIdx);
				var selectCertBag ={};
				
				selectCertBag = certBaglistObj
	
				var resultCode = false;
				if(typeof(selectCertBag.signcert)!=null){
	//				delete selectCertBag[storageCertIdx];
					delete selectCertBag["storageCertIdx"];
					//cert_string = JSON.stringify(selectCertBag);
					resultCode = true;
				}
	
				if(resultCode){
					//callback(0, {"cert": cert_string});
					callback(0, {"cert": selectCertBag});
				}else{
					callback( ML4WebLog.getErrCode("Storage_Web_GetCertString"), {"errCode": 201, "errMsg": $.i18n.prop("ER201")});
				}
			}
		}).catch(Storage_API_new_cloud.WebErrorException);
	},	
	SaveCert : function(certBag, passwd, storageRawCertIdx, callback){
		ML4WebLog.log("Storage_API_new_cloud.SaveCert22222() called...");		
		var fields					= ["startdatetime", "enddatetime", "issuername", "subjectname", "policyid", "subkeyid", "serialnum"];
		var crypto_api				= ML4WebApi.getCryptoApi();
		var signCert				= certBag.signcert;
		var pre_storageRawCertIdx	= storageRawCertIdx;
		var accesstime				= "";
		
		if (typeof(certBag.accesstime) != "undefined"){
			accesstime = certBag.accesstime;
		} else {
			accesstime = new Date().getTime();
		}
				
		try{
			crypto_api.getcertInfo(signCert, fields, function(code, message){						
				if(code == 0){
					var storageCertIdx = "";
					var base64decodeCert =  magicjs.base64.decode(certBag.signcert);
					var certfingerprint	 = crypto_api.genHash("sha1", base64decodeCert);
					
					if(ML4WebApi.getProperty("libType") == 0){
						storageCertIdx = message.subkeyid;
					}else{
						storageCertIdx = message.result.subkeyid;
					}
					
					var kftcobj = new Object();
					
					kftcobj.fingerprint		= certfingerprint.resulthex;							
					kftcobj.timestamp		= accesstime;														
					kftcobj.status			= "SAVE";
					kftcobj.notBefore		= message.result.startdatetime;
					kftcobj.notAfter		= message.result.enddatetime;
					kftcobj.issuer			= encodeURIComponent(message.result.issuername);
					kftcobj.subject			= encodeURIComponent(message.result.subjectname);
					kftcobj.policyOID		= message.result.policyid;
					kftcobj.serial			= message.result.serialnum;
					kftcobj.source			= "LOCAL";
					
					certBag.storageCertIdx	= storageCertIdx;
					certBag.kftc = kftcobj;
					
					pre_storageRawCertIdx.storageCertIdx = storageCertIdx;
					Storage_API_new_cloud.DeleteCert(pre_storageRawCertIdx, function(code2, result2){
						if(code2 == 0){
	
							var newLocalCertList = [];
							
							var crtLocalCertList = Storage_API_new_cloud.getML4WebCert();
							if(crtLocalCertList != null && crtLocalCertList != ""){
								newLocalCertList = JSON.parse(crtLocalCertList);
							}
	
							newLocalCertList.push(certBag);
							var newLocalCertListStr = JSON.stringify(newLocalCertList);
							
							Storage_API_new_cloud.setML4WebCert(newLocalCertListStr);
	
							callback(0, {"result":true});
							
						}else{									
							callback( ML4WebLog.getErrCode("Storage_Web_SaveCert"), {"errCode": code2, "errMsg": $.i18n.prop("ER201")});
						}
					});
				}else{
					//fail to getcertInfo
					callback( ML4WebLog.getErrCode("Storage_Web_SaveCert"), {"errCode": code, "errMsg": JSON.stringify(message)});
				}
			});
		}catch(e){
			callback( ML4WebLog.getErrCode("Storage_Web_SaveCert"), {"errCode": 888, "errMsg": e.message});
		}
	},
	SaveCertBag : function(certBag, storageRawCertIdx, callback){
		ML4WebLog.log("Storage_API_new_cloud.SaveCertBag() called...");		
		var fields					= ["startdatetime", "enddatetime", "issuername", "subjectname", "policyid", "subkeyid", "serialnum"];
		var crypto_api				= ML4WebApi.getCryptoApi();
		var signCert				= certBag.signcert;
		var pre_storageRawCertIdx	= storageRawCertIdx;
		var accesstime				= "";
		
		if (typeof(certBag.accesstime) != "undefined"){
			accesstime = certBag.accesstime;
		} else {
			accesstime = new Date().getTime();
		}
		
		try{
			crypto_api.getcertInfo(signCert, fields, function(code, message){						
				if(code == 0){
					var storageCertIdx = "";
					var base64decodeCert =  magicjs.base64.decode(certBag.signcert);
					var certfingerprint	 = crypto_api.genHash("sha1", base64decodeCert);
					
					if(ML4WebApi.getProperty("libType") == 0){
						storageCertIdx = message.subkeyid;
					}else{
						storageCertIdx = message.result.subkeyid;
					}
					
					var kftcobj = new Object();
					
					kftcobj.fingerprint		= certfingerprint.resulthex;
					kftcobj.timestamp		= accesstime;														
					kftcobj.status			= "SAVE";
					kftcobj.notBefore		= message.result.startdatetime;
					kftcobj.notAfter		= message.result.enddatetime;
					kftcobj.issuer			= encodeURIComponent(message.result.issuername);
					kftcobj.subject			= encodeURIComponent(message.result.subjectname);
					kftcobj.policyOID		= message.result.policyid;
					kftcobj.serial			= message.result.serialnum;
					kftcobj.source			= "LOCAL";
					
					certBag.storageCertIdx	= storageCertIdx;
					certBag.kftc = kftcobj;
					
					pre_storageRawCertIdx.storageCertIdx = storageCertIdx;
					Storage_API_new_cloud.DeleteCert(pre_storageRawCertIdx, function(code2, result2){
						if(code2 == 0){

							var newLocalCertList = [];
							
							var crtLocalCertList = Storage_API_new_cloud.getML4WebCert();
							if(crtLocalCertList != null && crtLocalCertList != ""){
								newLocalCertList = JSON.parse(crtLocalCertList);
							}

							newLocalCertList.push(certBag);
							var newLocalCertListStr = JSON.stringify(newLocalCertList);
							
							Storage_API_new_cloud.setML4WebCert(newLocalCertListStr);

							callback(0, {"result":true});
						}else{									
							callback( ML4WebLog.getErrCode("Storage_Web_SaveCert"), {"errCode": code2, "errMsg": $.i18n.prop("ER201")});
						}
					});
				}else{
					//fail to getcertInfo
					callback( ML4WebLog.getErrCode("Storage_Web_SaveCert"), {"errCode": code, "errMsg": JSON.stringify(message)});
				}
			});
		}catch(e){
			callback( ML4WebLog.getErrCode("Storage_Web_SaveCert"), {"errCode": 888, "errMsg": e.message});
		}
	},
	SelectStorageInfo : function(storageName, callback){
		var storageInfo = {};
		//TODO Delete dummy data
		//storageInfo = {"servicename" : "new_cloud"}; 

		if(true){
			//ex. 정상 callback
			callback(0, storageInfo);
		}else{
			//ex. error callback
			callback( ML4WebLog.getErrCode("Storage_cloud_SelectStorageInfo"), {"errCode": 201, "errMsg": $.i18n.prop("ER201")});
		}
	},
	GetCertList : function(storageOpt, callback){
		ML4WebLog.log("Storage_API_new_cloud.GetCertList() called...");

		cloudWeb.getCertificateListInfo().then(function (res) {

			Storage_API_new_cloud.PrintArrayResult(res);
			var tempArr = [];
	        if(res.length >= 0){
			    //Storage_API_new_cloud.res_true = 1;
				//document.getElementById('manual_img').src = 'UI/images/new_cloud_on.png';

	      	  	/*
 	      	    $('#certList').style = 'display:block;';
				let certList = id_coll('certList');
		        let row1 = document.createElement('span');
		        row1.style = 'display:flex;';

				var html = '';
				html += '<button name="dis_button" id="dis_button" onclick="Storage_API_new_cloud.disConnect();">연결끊기</button>';
				html += '<button name="dis_button" id="dis_button" onclick="Storage_API_new_cloud.deleteAccount();">회원탈퇴</button>';
				row1.innerHTML = html;
		        certList.appendChild(row1);
		        */	      	  	      	  

				for (var iter = 0; iter < res.length; iter++) {
					var cert = res[iter];
			        //let cert = res[iter];
					cert.aia = "";
					cert.authkeyid = "";
					cert.certpath = "";
					cert.certpolicy = "";
					cert.crldp = "";
					cert.enddate = res[iter]['cert_end_date'].substr(0,10);
					cert.enddatetime = res[iter]['cert_end_date'];
					cert.issuername = yt.util.decodeUTF8(atob(res[iter]['issue_dn']));
					cert.keyusage = "";
					cert.policyid = yt.util.decodeUTF8(atob(res[iter]['oid']));
					cert.policynotice = "";
					cert.pubkey = "";
					cert.pubkeyalgorithm = "";
					cert.realname = "";
					cert.serialnum = res[iter]['serial'];
					cert.signaturealgorithm = "";
					cert.startdate = res[iter]['cert_start_date'].substr(0,10);
					cert.startdatetime = res[iter]['cert_start_date'];
					cert.storageEncCertIdx = res[iter]['cert_id'];
					cert.subjectaltname ="";
					cert.subjectname = yt.util.decodeUTF8(atob(res[iter]['subject_dn']));
					cert.subkeyid = "";
					cert.version = res[iter]['ver']; 
			        cert.storageRawCertIdx = "";
			        tempArr[iter] = cert;
			        
				}
				callback(0, {"cert_list": tempArr});
			}else{
				callback(0, {"cert_list": 0});
			}
		}, function(error) {
			Storage_API_new_cloud.WebErrorException(error);
		});
	},
  getCertificateListInfo : function() {
    cloudWeb.getCertificateListInfo().then(function (res) {
      //console.log('getCertificateListInfo result=', res);
      //debugger;
      Storage_API_new_cloud.PrintArrayResult(res);

      let certList = id_coll('certList');//$('certList');
      
      while (certList.hasChildNodes()) {
        certList.removeChild(certList.firstChild);
      }

      for (let iter = 0; iter < res.length; iter++) {
        let cert = res[iter];
        let row = document.createElement('span');
        row.style = 'display:flex;';

        let radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', 'radioGroup_cert');
        radio.setAttribute('cert_ids', cert['cert_id']);
        radio.style.marginTop = '6px';

        row.appendChild(radio);

		let subject_dn = yt.util.decodeUTF8(atob(cert['subject_dn']));
		let subject_dn_temp2 = subject_dn.substr(3);
		let subject_dns = subject_dn_temp2.split(',', 1);
		
        let el = document.createElement('div');
        el.className = 'certInfo';
        el.innerText = subject_dns;

        el.addEventListener('click', function (evt) {
          evt.target.previousSibling.click();
        });
             
        row.appendChild(el);
        certList.appendChild(row);
        
        let row2 = document.createElement('span');
        row2.style = 'display:flex;';
        
        let bu = document.createElement('img');
        bu.setAttribute('src', 'UI/images/icon_del.png');
        bu.setAttribute('name', 'delete_img');
        bu.setAttribute('onclick', 'Storage_API_new_cloud.deleteCertificate()');
        
        row2.appendChild(bu);
        
        let fi = document.createElement('img');
        fi.setAttribute('src', 'UI/images/btn_key.png');
        fi.setAttribute('name', 'cert_pin');
        fi.setAttribute('id', 'cert_pin');
        fi.setAttribute('onclick', 'Storage_API_new_cloud.exportCertificate()');
        fi.style.marginLeft = '15px';
        row2.appendChild(fi);
        
        certList.appendChild(row2);
      }
	}).catch(Storage_API_new_cloud.WebErrorException);
  },
  getCertificateListInfo2 : function() {
    cloudWeb.getCertificateListInfo().then(function (res) {
		//var certBaglist2   = "[]";

		for (var iter = 0; iter < res.length; iter++) {
        	var cert = res[iter];
        	
        	var certBaglist2 = object();
        	certBaglist2.cert_end_date = cert['cert_end_date'];
			certBaglist2.cert_id = cert['cert_id'];
			certBaglist2.cert_start_date = cert['cert_start_date'];
			certBaglist2.error_count = cert['error_count'];
			certBaglist2.expire_date = cert['expire_date'];
			certBaglist2.is_lock = cert['is_lock'];
			certBaglist2.issue_dn = cert['issue_dn'];
			certBaglist2.last_update_date = cert['last_update_date'];
			certBaglist2.oid = cert['oid'];
			certBaglist2.serial = cert['serial'];
			certBaglist2.subject_dn = yt.util.decodeUTF8(atob(cert['subject_dn']));
			certBaglist2.ver = cert['ver'] 
		}
			//certBaglist2;              	
	});
  },

  getCertificate : function() {
	  let ele = document.querySelector('input[name="radioGroup_cert"]:checked');
      if (ele == null) {
        alert('인증서를 선택하세요');
        return;
      }
      let certID = ele.getAttribute('cert_ids');

      UI_PIN('인증서 가져오기 PIN 입력', function(PIN1) {
        PIN1 = secureData.setData(PIN1);
        cloudWeb.getCertificate([certID], PIN1).then(function (res) {
          console.log('getCertificate result=', res);
          
          let getCertificateResult = res[0];
          /*
           * 이중 암호화된 값(‘key’, ‘kmkey’, ‘secret’) 사용법
           * 1. SecureData 객체를 통해 복호화 (SecureData.prototype.getData API)
           * 2. 복호화된 값 base64 디코딩
           */
          let key = atob( secureData.getData( getCertificateResult['key'] ) );
          let kmkey;
          if (typeof getCertificateResult['kmkey'] !== 'undefined')
            kmkey = atob( secureData.getData( getCertificateResult['kmkey'] ) );
          let secret = atob( secureData.getData( getCertificateResult['secret'] ) );


          console.log(key+" || "+kmkey+" || "+secret);
          id_coll('result').value = JSON.stringify( getCertificateResult );
        }).catch(Storage_API_new_cloud.WebErrorException);
      }, function(error) {
        console.log(error);
      });
  },
 importCertificate : function(certBag, passwd, pin) {
	Storage_API_new_cloud.certBag = certBag;
	Storage_API_new_cloud.certpass = passwd;
	Storage_API_new_cloud.pin = pin;
  UI_CERT_SELECT(function(cert, key, kmcert, kmkey) {
    UI_CERT_PWD(function(certPwd) {
      certPwd = secureData.setData(certPwd);
      UI_PIN('인증서 등록 PIN 입력', function(pin) {
        pin = secureData.setData(pin);
        //console.log(certPwd, pin, cert, key, kmcert, kmkey);
        //debugger;
        cloudWeb.importCertificate(certPwd, pin, cert, key, kmcert, kmkey).then(function (res) {
          //console.log('importCertificate result=', res);
          //debugger;
          id_coll('result').value = res;
          Storage_API_new_cloud.getCertificateListInfo(); 
        }).catch(Storage_API_new_cloud.WebErrorException);
      }, function(error) {
        console.log(error);
      });
    }, function(error) {
      console.log(error);
    });
  }, function(error) {
    console.log(error);
  });
 },
  exportCertificate : function() {
    let ele = document.querySelector('input[name="radioGroup_cert"]:checked');
    if (ele == null) {
      alert('인증서를 선택하세요');
      return;
    }
    let certID = ele.getAttribute('cert_ids');
   UI_CERT_PWD(function(certPwd) {
	  Storage_API_new_cloud.certpass = certPwd;
	  Datapass = secureData.setData(certPwd);
      UI_PIN('인증서 내보내기 PIN 입력', function(PIN1) {
		Storage_API_new_cloud.pin = PIN1;
		//Storage_API_new_cloud.certpass = PIN1;		  
        DataPIN1 = secureData.setData(PIN1);
        //cloudWeb.exportCertificate([certID], DataPIN1, Datapass).then(function (res) {
		cloudWeb.getCertificate([certID], DataPIN1).then(function (res) {
          //console.log('exportCertificate result=', res);
          Storage_API_new_cloud.PrintArrayResult(res);
          var temp = new Object();
          temp.cert = res[0]['cert'];
          temp.cert_id = res[0]['cert_id'];
          temp.key = secureData.getData(res[0]['key']);

          if (typeof res[0]['kmcert'] !== 'undefined') temp.kmcert = res[0]['kmcert'];          
          if (typeof res[0]['kmkey'] !== 'undefined') atob(temp.kmkey = secureData.getData( res[0]['kmkey'] ));
          temp.last_update_date = res[0]['last_update_date'];
          if (typeof res[0]['secret'] !== 'undefined') temp.secret = atob(secureData.getData(res[0]['secret']));
          temp.seed = res[0]['seed'];
          
          importCertToCloud(temp,Storage_API_new_cloud.certpass);
        }).catch(Storage_API_new_cloud.WebErrorException);
      }, function(error) {
        console.log(error);
      });
    }, function(error) {
      console.log(error);
    });
  },
  deleteCertificate : function() {
    let ele = document.querySelector('input[name="radioGroup_cert"]:checked');
    if (ele == null) {
      alert('인증서를 선택하세요');
      return;
    }
    let certID = ele.getAttribute('cert_ids');

    cloudWeb.deleteCertificate([certID]).then(function (res) {
      console.log('deleteCertificate result=', res);
      id_coll('result').value = res;
      Storage_API_new_cloud.getCertificateListInfo();
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  changePin : function() {
    let ele = document.querySelector('input[name="radioGroup_cert"]:checked');
    if (ele == null) {
      alert('인증서를 선택하세요');
      return;
    }
    let certID = ele.getAttribute('cert_ids');

    UI_PIN_CHANGE(function(PIN1, PIN2) {
      PIN1 = secureData.setData(PIN1);
      PIN2 = secureData.setData(PIN2);
      cloudWeb.changePin([certID], PIN1, PIN2).then(function (res) {
        console.log('changePin result=', res);
        id_coll('result').value = res;
      }).catch(Storage_API_new_cloud.WebErrorException);
    }, function(error) {
      console.log(error);
    });
  },
  checkConnect : function() {
    cloudWeb.checkConnect().then(function (res) {
      console.log('checkConnect result=', res);
      id_coll('result').value = res;
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  getAutoConnectInfo : function() {
    cloudWeb.getAutoConnectInfo().then(function (res) {
      console.log('getAutoConnectInfo result=', res);
      Storage_API_new_cloud.PrintArrayResult(res);

      let autoConnectList = id_coll('autoConnectList');
      while (autoConnectList.hasChildNodes()) {
        autoConnectList.removeChild(autoConnectList.firstChild);
      }

      let table = document.createElement('table');
      table.style = 'display:inline-block;font-size:small;';
      let thead = document.createElement('thead');
      thead.style = 'border-bottom:1px solid black';
      thead.style.display = 'flex';

      let td = document.createElement('th');
      td.innerText = '선택'; thead.appendChild(td);
      td = document.createElement('th');
      td.innerText = '날짜'; thead.appendChild(td);
      td = document.createElement('th');
      td.innerText = '환경'; thead.appendChild(td);
      td = document.createElement('th');
      td.innerText = 'IP'; thead.appendChild(td);
      td = document.createElement('th');
      td.innerText = '장치정보'; thead.appendChild(td);

      table.appendChild(thead);

      let tbody = document.createElement('tbody');
      for (let iter = 0; iter < res.length; iter++) {
        let connInfo = res[iter];
        let row = document.createElement('tr');
        row.style.display = 'flex';
        row.style.cursor = 'pointer';

        let td = document.createElement('td');
        let radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', 'radioGroup_conn');
        radio.setAttribute('deviceID', connInfo['device_id']);
        td.appendChild(radio);
        row.appendChild(td);

        td = document.createElement('td');
        td.innerText = connInfo['date']; row.appendChild(td);
        td = document.createElement('td');
        td.innerText = connInfo['os']; row.appendChild(td);
        td = document.createElement('td');
        td.innerText = connInfo['ip']; row.appendChild(td);
        td = document.createElement('td');
        td.innerText = connInfo['device_info']; row.appendChild(td);

        row.addEventListener('click', function (evt) {
          evt.target.parentElement.getElementsByTagName('input')[0].click();
        });
        tbody.appendChild(row);
        table.appendChild(tbody);
      }
      autoConnectList.appendChild(table);
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  getMemeberHistory : function() {
    cloudWeb.getMemeberHistory().then(function (res) {
      console.log('getMemeberHistory result=', res);
      Storage_API_new_cloud.PrintArrayResult(res);
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  getCertHistory : function() {
	  
    let ele = document.querySelector('input[name="radioGroup_cert"]:checked');

    if (ele == null) {
      alert('인증서를 선택하세요');
      return;
  	}
      
    let cert_id = ele.getAttribute('cert_ids');

    cloudWeb.getCertHistory(cert_id).then(function (res) {
      console.log('getCertHistory result=', res);
      Storage_API_new_cloud.PrintArrayResult(res);
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  getUserInfo : function() {
    cloudWeb.getUserInfo().then(function (res) {
      console.log('getUserInfo result=', res);
      id_coll('result').value = JSON.stringify(res);
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  activeCertificate : function() {
    let ele = document.querySelector('input[name="radioGroup_cert"]:checked');
    if (ele == null) {
      alert('인증서를 선택하세요');
      return;
    }
    let certID = ele.getAttribute('cert_ids');

    cloudWeb.activeCertificate([certID]).then(function (res) {
      console.log('activeCertificate result=', res);
      id_coll('result').value = res;
      Storage_API_new_cloud.getCertificateListInfo();
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  moAuthenticate : function() {
    cloudWeb.moAuthenticate().then(function (res) {
      console.log('moAuthenticate result=', res);
      id_coll('result').value = res;
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  deleteAutoConnect : function() {
    let ele = document.querySelector('input[name="radioGroup_conn"]:checked');
    if (ele == null) {
      alert('자동연결 매체 조회 및 선택 후 진행하세요');
      return;
    }
    let deviceID = ele.getAttribute('deviceid');

    cloudWeb.deleteAutoConnect(deviceID).then(function (res) {
      console.log('deleteAutoConnect result=', res);
      id_coll('result').value = res;
      Storage_API_new_cloud.getAutoConnectInfo();
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  deleteAccount : function() {
    cloudWeb.deleteAccount().then(function (res) {
      console.log('deleteAccount result=', res);
      id_coll('result').value = res;
      Storage_API_new_cloud.getCertificateListInfo();
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  clearSession : function() {
    cloudWeb.clearSession().then(function (res) {
      console.log('clearSession result=', res);
      id_coll('result').value = res;
      Storage_API_new_cloud.getCertificateListInfo();
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  getCurrentDeviceId : function() {
  	var currentDvcId = cloudWeb.getCurrentDeviceId();
  	console.log('getCurrentDeviceId result=', currentDvcId);
  } , 
  disConnect : function() {
    cloudWeb.disConnect().then(function (res) {
      console.log('disConnect result=', res);
      /*if(res == true){
		  document.getElementById('manual_img').src = 'UI/images/new_cloud_off.png';
		  document.getElementById('certList').style = 'display:none';
	  }*/
    }).catch(Storage_API_new_cloud.WebErrorException);
  },
  PrintArrayResult : function(res) {
    let result = '';
    res.forEach(function(info) {
      result += JSON.stringify(info) + '\n';
    });
    //id_coll('result').value = result;
  },
  WebErrorException : function(e) {
    //console.log('error', e);
	switch(e['code']){
		case 20900 :
			e.error.message = "IP는 실행불가.";
		break;
		case 5206 : 
		case 5210 :
		case 5201 :
			e.error.message = "인증번호 맞지 않음 <br>30초후 다시 해주세요.";
		break;
	}
    ML4WebDraw.errorHandler("main", "오류코드 : "+ e.error.code + "<br>오류메시지 : " +e.error.message + "<br>상세메시지 : "+e.error.detail, null, null);
  },
  getSecureSetting : function() {
      cloudWeb.getSecureSetting().then(function(res){

        document.getElementById('service_time').checked = res.service_time;
        document.getElementById('start_time').value = (typeof res.start_time === 'string' ? res.start_time : '0000');
        document.getElementById('end_time').value =(typeof res.end_time === 'string' ? res.end_time : '0000');
        document.getElementById('local_service').checked = res.local_service;

        console.log('GetSecureSetting success', res);
      }).catch(function(error){
        console.log('GetSecureSetting failed', error);
      });
    },
    setSecureSetting : function(res) {

      let service_time = document.getElementById('service_time').checked;
      let start_time = document.getElementById('start_time').value;
      let end_time = document.getElementById('end_time').value;
      let local_service = document.getElementById('local_service').checked;

      if(start_time == '') start_time = '0000';
      if(end_time == '') end_time = '0000';

      cloudWeb.setSecureSetting(service_time, start_time, end_time, local_service).then(function(res){
        console.log('SetSecureSetting success', res);
      }).catch(function(error){
        console.log('SetSecureSetting failed', error);
        console.log('param', service_time, start_time, end_time, local_service);
      });
    },
    setBillTrail : function() {
      let ele = document.querySelector('input[name="radioGroup_cert"]:checked');

      if (ele == null) {
        alert('인증서를 선택하세요');
        return;
      }
      let cert_id = ele.getAttribute('cert_ids');
      let action = 0;
      let count = 1;
    
      cloudWeb.setBillTrail(cert_id, action, count, false).then(function (res) {
        console.log('setBillTrail result=', res);
      }).catch(function(error){
        console.log('setBillTrail failed', error);
        console.log('param', cert_id, action, count);
      });
    }  
};


