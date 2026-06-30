<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>
<%@ page import="com.dreamsecurity.magice2e.MagicE2E" %>
<%@ page import="com.dreamsecurity.magicline.util.Base64" %>
<%
	String sessionString = "";
	int result = 0;
	StringBuffer sbCert = new StringBuffer();
	//MagicE2E.setConfPath("C:/Users/jung/eclipse-workspace/MagicLine4Web_Ratato/WebContent/WEB-INF/magicline/config/");
	// 세션에 값이 있는지 확인
	
	MagicE2E temp = ( MagicE2E ) session.getAttribute("Magie2e");
	
	if( temp == null ){
		MagicE2E ml = new MagicE2E( sbCert );
		sessionString = sbCert.toString();
		session.setAttribute( "Magie2e", ml );
	}else{
		result = MagicE2E.init();
		if( result == 0 ){
			result = temp.open( sbCert );
			if( result == 0 ){
				sessionString = sbCert.toString();	
			}else{
				temp.close();
				session.invalidate();
			}
		}else{
			temp.close();
			session.invalidate();
		}
		
	}
%>
<script src="../ML4Web/js/crypto/magicjs_1.2.7.2.min.js"></script>
<script src="../ML4Web/js/magic_e2e.js"></script>
<script type="text/javascript">

var isResultShown = false;

function doSignData(){
	
	var signData = $("#signData").val();
	
	if(signData.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData").focus();
		return;
	}
	document.reqForm.signOrigin.value = document.reqForm.signData.value;
	magicline.uiapi.MakeSignData(document.reqForm, null, mlCallBack);
}

function signResultDralwer(message){
	
	var htmlStream = "";
	
	if(typeof(message) === "undefiend"){
		alert('No message for signature. \nPlease make sure sign data');
		return;
	}
	
	for(var key in message){
		htmlStream += '<tr>';
		htmlStream += '	<td>' + key + '</td>';
		htmlStream += '	<td>' + message[key] + '</td>';
		htmlStream += '</tr>';
	}
	
	htmlStream += '<tr>';
	htmlStream += '	<td colspan="2" class="buttonRow" align="center">';
	htmlStream += '		<input type="button" class="button" value="전송" name="Submit" onClick="this.form.submit();">';
	htmlStream += ' </td>';
	htmlStream += '</tr>';
	
	$("#signatureResultArea").html(htmlStream);
	
	if(!isResultShown){			
		isResultShown=true;			
		$("#signatureResultDiv").css("display", "");
	}
}

// MagicLine 결과값 수신 CallBack
// code    : 전자서명 결과값
// message : 전자서명 메시지
function mlCallBack(code, message){
	if(code==0){ // 정상
		//console.log(message);
		document.reqForm.sign.value = encodeURIComponent( message.encMsg );
		
		// 개인정보 암호화
		if($('#idn').val() != ""){
			dataEncrypt($('#idn').val()); 
		}
		
		if(message.vidRandom != null){
			document.reqForm.vidRandom.value = encodeURIComponent(message.vidRandom);
			document.reqForm.action = "./vidClientIDNR.jsp";
			document.reqForm.submit();
		}else{
			magicline.uiapi.getRandomfromPrivateKey(function(code, vidRandom){
				if(code == 0){
					document.reqForm.vidRandom.value = vidRandom;
					document.reqForm.action = "./vidClientIDNR.jsp";
					document.reqForm.submit();
				} 
			});
		}
		//signResultDralwer(message);
		
	}else{ // 수신 오류
		alert("결과값 수신에 실패하였습니다.");
		return;
	}
}


function dataEncrypt(idn){
	var ml = new MagicE2E(<%=sessionString%>);
	
	$('#encIdn').val(idn);
	
	document.reqForm.encData.value = ml.Encrypt($('#encForm').serialize());
}
</script>
<table border="2">
	<thead>
		<tr>
			<th colspan="2">MagicE2E Result</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>sbCert</td>
			<td><%=sbCert.toString() %></td>
		</tr>
	</tbody>
</table>
<div id="middle">
	<h2>MagicLine Digital Signature</h2>
	
	<div id="workArea"><!-- DIV START  -->	
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>&nbsp;&nbsp;웹 구간 전달 메시지 전체에 대해 클라이언트에서 전자서명을 실행합니다.</td>
		</tr>
	</table>
	<p>&nbsp;</p>
	<form id='encForm' name='encForm' method='post'>
	<input type="hidden" id="encIdn" name="encIdn" value=""/>
	</form>
	<form id='reqForm' name='reqForm' method='post' action="./vidClientIDNR.jsp">
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id="signOrigin" name="signOrigin" />
	<input type="hidden" id="vidRandom" name="vidRandom"/>
	<input type="hidden" id="vidType" name="vidType" value="client"/>
	<input type="hidden" id="encData" name="encData" value=""/>
	
	<!-- 원문 데이터 입력 영역 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
			<tr>
				<th colspan="2">Client Digital Signature Information</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="formRow">
					<table class="normal" cellspacing="0" style="text-align: left;">
						<tr>
							<td>전자서명 원문 데이터를 입력한다<font class="required">*</font></td>
							<td>
								<textarea name="signData" rows="3" cols="60" id="signData"></textarea>								
							</td>
						</tr>
						<tr>
							<td>주민등록번호<font class="required">*</font></td>
							<td>
								<input type="text" name="idn"  id="idn" value=""/>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td colspan="2" class="buttonRow">				
					<input name="Submit" type="button" class="button" value="전자서명" onclick="javascript:doSignData();"/>					
				</td>
			</tr>
		</tbody>
	</table>
	
	<!-- 전자서명 데이터 출력 영역 -->
	<div id="signatureResultDiv" style="display:none;" >
	<table style="width: 100%; height:100%"  class="styledLeft" >
		<thead>
			<tr>
				<th colspan="2">Signature Data Information</th>
			</tr>
		</thead>
		<tbody id="signatureResultArea">
		</tbody>
	
	</table>
		
	</div>
	</form>
	<p>&nbsp;</p>
	
	</div>
</div>
<jsp:include page="include/footer.jsp"></jsp:include>