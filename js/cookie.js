/**
  * @date  2011/12
  * @brief Cookie 存取類別
  * @email colin1124x@gmail.com
*/
(function(){
	//內部方法:解析真正Cookie格式存於_obj_all_cookies
	var _isChanged = true;
	var _obj_all_cookies = {};
	var _re_cookie_mod = /[^;]+/g;
	var _re_cookies_find = /\s*([^=]+)\s*=\s*(.*)\s*/g;
	function _parse_cookie()
	{
		if (_isChanged)
		{
			_obj_all_cookies = {};
			document.cookie.replace(_re_cookie_mod, function(m){
				if (!(/=/.test(m)))
				{
					_obj_all_cookies[''] = _parse_prop(m);
				}
				else
				{
					m.replace(_re_cookies_find, function(m1,m2,m3){
						_obj_all_cookies[m2] = _parse_prop(m3);
					});
				}
			});
			_isChanged = false;
		}
		return _obj_all_cookies;
	}
	
	//內部方法:解析類別定義參數格式 name1:val1&name2=val2
	var _spliter = ':';
	var _spliter_prop = '&';
	var _re_props_find = /\s*([^&\:]+)\s*\:\s*([^&\:]+)\s*/g;
	function _parse_prop(str)
	{
		if (str.match(_re_props_find)) 
		{
			var props = {};
			str.replace(_re_props_find, function(m1,m2,m3){
				props[m2] = decodeURIComponent(m3);
			});
			return props;
		}
		else
		{
			return decodeURIComponent(str);
		}
	}
	//內部方法:
	function _unparse_prop(name)
	{
		var cookieval = _obj_all_cookies[name] || '';
		if (cookieval instanceof Object)
		{
			var _arr = [];
			for (var x in cookieval)
			{
				_arr[_arr.length] = x + _spliter + encodeURIComponent(cookieval[x]);
			}
			cookieval = _arr.join(_spliter_prop);
		}
		return cookieval;
	}
	
	function _get_cookie(name, key)
	{
		if ('undefined' == typeof key)
		{
			return _obj_all_cookies[name] || '';
		}
		return (_obj_all_cookies[name] && (_obj_all_cookies[name] instanceof Object))? (_obj_all_cookies[name][key]||'') : '';
	}
	
	function _set_cookie(name, args)
	{
		switch (args.length)
		{
			case 1:
				_obj_all_cookies[name] = args[0];
				break;
			
			case 2:
				if (!_obj_all_cookies[name] || !(_obj_all_cookies[name] instanceof Object))
				{
					_obj_all_cookies[name] = {};
				}
				_obj_all_cookies[name][args[0]] = args[1];
				break;
				
			default:/*empty*/
		}
	}
	function _unset_cookie(name, key)
	{
		if (_obj_all_cookies[name] instanceof Object)
		{
			delete _obj_all_cookies[name][key];
		}
	}
	
	//類別建構式
	var _cache_all_cookie_obj = {};
	Cookie = function(name, time, path, domain, secure)
	{
		_parse_cookie();
		if (_cache_all_cookie_obj[name])
		{
			return _cache_all_cookie_obj[name];
		}
		else
		{
			this.name = name || '';
			this.time = time;
			this.path = path;
			this.domain = domain;
			this.secure = secure;
			this.store();
			_cache_all_cookie_obj[name] = this;
		}
	}

	//類別方法:清除特定Cookie
	Cookie.die = function(name)
	{
		if (_cache_all_cookie_obj[name])
		{
			_cache_all_cookie_obj[name].die();
			delete _cache_all_cookie_obj[name];
		}
	}
	//類別方法:清除所有Cookie
	Cookie.cleanAll = function()
	{
		var o = _parse_cookie();
		for (var x in o)
		{
			var _continue = false;
			for (var i=0,L=arguments.length; i<L; ++i)
			{
				var arg = (arguments[i] instanceof Array)? arguments[i] : [arguments[i]] ;
				for (var j=0,jL=arg.length; j<jL; ++j)
				{
					if (x === arg[j])
					{
						_continue = true;
						break;
					}
				}
				if (_continue) {break;}
			}
			if (_continue) {continue;}
			new Cookie(x).die();
		}
	}
	//類別方法:取得Cookie數量
	Cookie.getNum = function()
	{
		var cnt = 0;
		for (var x in _cache_all_cookie_obj)
		{
			cnt++;
		}
		return cnt;
	}
	//類別方法:取得全部Cookie
	Cookie.getAll = function()
	{
		return _parse_cookie();
	}
	
	//物件方法:
	Cookie.prototype = {
		get : function(key)
		{//凡是找不到一律回傳空字串
			return _get_cookie(this.name, key);
		},
		set : function()
		{
			_set_cookie(this.name, arguments);
			this.store();
			return this;
		},
		//刪除實體內部資料
		unset : function(key)
		{
			_unset_cookie(this.name, key);
			this.store();
			return this;
		},
		//刪除
		die : function()
		{
			this.store(0);
			delete _cache_all_cookie_obj[this.name];
			return null;
		},
		store : function (time, path, domain, secure)
		{
			_isChanged = true;
			time = ('undefined' == typeof time)? this.time : time;
			path = ('undefined' == typeof path)? this.path : path;
			domain = ('undefined' == typeof domain)? this.domain : domain;
			secure = ('undefined' == typeof secure)? this.secure : secure;
			var cookie_stream = [];
			cookie_stream.push(this.name + '=' +_unparse_prop(this.name));
			if (time || 0 == time)
			{
				cookie_stream.push('max-age=' + time);
			}
			if (path) {cookie_stream.push('path=' + path);}
			if (domain) {cookie_stream.push('domain=' + domain);}
			if (secure) {cookie_stream.push('secure');}
			document.cookie = ''+cookie_stream.join('; ');
			return this;
		},
		toString : function()
		{
			return '[Cookie Object]';
		}
	};
})();