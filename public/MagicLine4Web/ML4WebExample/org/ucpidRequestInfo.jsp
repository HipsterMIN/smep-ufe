<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>
<script type="text/javascript">

//18.07.10
//1. 서명 원문 추가해서 signedFormR 에 서명 원문 데이터 파라미터 추가 
//2. 서명 원문 내용 출력 추가

// TODO : 반영할땐 result 출력 없이 해야됨.
var isResultShown = false;

function doSignData(){
	var signData		  = $("#signData").val();
	var ucpidRealName	  = $('[name=ucpidRealName]').prop('checked');
	var ucpidGender		  = $('[name=ucpidGender]').prop('checked');
	var ucpidNationalInfo = $('[name=ucpidNationalInfo]').prop('checked');
	var ucpidBirthDate	  = $('[name=ucpidBirthDate]').prop('checked');
	var ucpidCi			  = $('[name=ucpidCi]').prop('checked');
	var ispUrlInfo 		  = $("#ispUrlInfo").val();
	
	if(signData.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData").focus();
		return;
	}
	
	var userAgreement =signData;
	var ucpidNonce = new Array(16);
	
	for (var i=0; i<ucpidNonce.length; i++) 
		ucpidNonce[i] =Math.floor(Math.random() * 0x100);
	
	magicline.uiapi.makeUCPIDRequestInfo(userAgreement, 1, 1, 1, 1, 1, ucpidNonce, ispUrlInfo, mlCallBack);
}

function mlCallBack(code, message){
	if(code==0){
		console.log(message.encMsg);
		document.reqForm.sign.value = encodeURIComponent( message.encMsg );
		document.reqForm.submit();
	}else{
		alert("결과값 수신에 실패하였습니다.");
		return;
	}
}


</script>
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
			<td>&nbsp;&nbsp;공인인증서를 이용한 본인확인 서비스 가이드라인 부속서 v1.3</td>
		</tr>
	</table>
	
	<p>&nbsp;</p>
	<form id='reqForm' name='reqForm' method='post' action="./ucpidRequestInfoR.jsp">
	<!-- 결과 수신 메시지  -->
	<input type="hidden" id="signOrigin" name="signOrigin" /> <!-- 180701 서명 원문 폼 추가 -->
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id='csCheckType' name='csCheckType' value="1"/>
	
	<!-- 전자서명 데이터 입력 영역 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
			<tr>
				<th colspan="2">UCPIDRequestInfo</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="formRow">
					<table class="normal" cellspacing="0" style="text-align: left;">
						<tr style="height:100px;">
							<td>이용약관<font class="required">*</font></td>							
							<td>
								<textarea id="signData" name="signData" rows="3" cols="60">개인정보제공 및 활용동의 약관</textarea><br><br>
								<input type='checkbox'	name='ucpidRealName'	 value="Y" checked/> 이름
								<input type='checkbox'	name='ucpidGender'		 value="Y" checked/> 성별
								<input type='checkbox'	name='ucpidNationalInfo' value="Y" checked/> 국적
								<input type='checkbox'	iname='ucpidBirthDate'	 value="Y" checked/> 생년월일
								<input type='checkbox' 	name='ucpidCi'			 value="Y" checked/> 주민번호(ci)<br>
							</td>
						</tr>
						<tr style="height:100px;">
							<td>ispUrlInfo</td>
							<td><textarea id="ispUrlInfo" name="ispUrlInfo" rows="1" cols="60">www.dreamsecurity.com</textarea></td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td colspan="2" class="buttonRow" align="center">
					<input id="aaa" type="button" class="button" value="전자서명" onclick="doSignData();">
				</td>
			</tr>
		</tbody>
	</table>	
	</form>
	</div>
</div><!-- DIV END  -->
<div id="selectCertContainer1" style="width:100%;margin-top:0; display:none;"></div>
<div id="startCs" style="width:100%;margin-top:0; display:none;"></div>
<jsp:include page="include/footer.jsp"></jsp:include>